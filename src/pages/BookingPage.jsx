import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  lazy,
  Suspense,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { format, isBefore, startOfDay } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  DollarSign,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Lazy-load the Calendar to keep the initial bundle lighter
const Calendar = lazy(() =>
  import("@/components/ui/calendar").then((m) => ({ default: m.Calendar }))
);

// ---------------------------------------------------------------------------
// Constants (defined outside the component to avoid re-creation each render)
// ---------------------------------------------------------------------------

const DOG_SIZES = [
  {
    id: "small",
    label: "Small",
    description: "Under 20 lbs",
    priceModifier: 0,
  },
  {
    id: "medium",
    label: "Medium",
    description: "20–50 lbs",
    priceModifier: 10,
  },
  {
    id: "large",
    label: "Large",
    description: "50–80 lbs",
    priceModifier: 20,
  },
  {
    id: "xlarge",
    label: "X-Large",
    description: "Over 80 lbs",
    priceModifier: 30,
  },
];

const TIP_OPTIONS = [
  { label: "No tip", value: "none", percent: null },
  { label: "15%", value: "15%", percent: 15 },
  { label: "20%", value: "20%", percent: 20 },
  { label: "25%", value: "25%", percent: 25 },
  { label: "Custom", value: "custom", percent: null },
];

const TIME_SLOTS = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
];

const PHONE_REGEX = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

/** Returns true when phone matches common North-American formats. */
const isValidPhone = (phone) => PHONE_REGEX.test(phone.trim());

/** Returns true when email is either empty or a valid address. */
const isValidEmail = (email) =>
  email.trim() === "" || EMAIL_REGEX.test(email.trim());

// ---------------------------------------------------------------------------
// BookingPage component
// ---------------------------------------------------------------------------

export default function BookingPage() {
  const navigate = useNavigate();

  // ── UI state ──────────────────────────────────────────────────────────────
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customTip, setCustomTip] = useState("");

  // ── Booking data ──────────────────────────────────────────────────────────
  const [booking, setBooking] = useState({
    service: null,
    dogSize: null,
    date: null,
    time: null,
    ownerName: "",
    dogName: "",
    phone: "",
    email: "",
    notes: "",
    tipType: "none",
    tipAmount: 0,
    confirmationNumber: null,
  });

  // ── Validation errors ─────────────────────────────────────────────────────
  const [errors, setErrors] = useState({});

  // ── Fetch services on mount (with abort on unmount) ───────────────────────
  useEffect(() => {
    const controller = new AbortController();

    const fetchServices = async () => {
      setIsLoadingServices(true);
      try {
        const baseUrl =
          process.env.REACT_APP_BACKEND_URL ||
          process.env.VITE_BACKEND_URL ||
          "";
        const { data } = await axios.get(`${baseUrl}/api/services`, {
          signal: controller.signal,
        });
        setServices(data);
      } catch (err) {
        if (axios.isCancel(err)) return; // component unmounted – ignore
        toast.error("Failed to load services. Please refresh the page.");
      } finally {
        setIsLoadingServices(false);
      }
    };

    fetchServices();
    return () => controller.abort();
  }, []);

  // ── Derived price ─────────────────────────────────────────────────────────
  const getPrice = useCallback(() => {
    if (!booking.service) return 0;
    const base = booking.service.price ?? 0;
    const modifier = booking.dogSize?.priceModifier ?? 0;
    return base + modifier;
  }, [booking.service, booking.dogSize]);

  // ── Tip calculation ───────────────────────────────────────────────────────
  const totalAmount = useMemo(
    () => getPrice() + booking.tipAmount,
    [getPrice, booking.tipAmount]
  );

  // ── Date disabling ────────────────────────────────────────────────────────
  /**
   * Disables past dates and Sundays.
   * Uses startOfDay to avoid same-day near-midnight edge cases.
   */
  const isDateDisabled = useCallback((date) => {
    const today = startOfDay(new Date());
    return isBefore(date, today) || date.getDay() === 0;
  }, []);

  // ── Step navigation helpers ───────────────────────────────────────────────
  const goNext = useCallback(() => setStep((s) => s + 1), []);
  const goBack = useCallback(() => setStep((s) => s - 1), []);

  // ── Field-level update ────────────────────────────────────────────────────
  const updateBooking = useCallback((patch) => {
    setBooking((prev) => ({ ...prev, ...patch }));
    // Clear related errors when the user updates a field
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(patch).forEach((k) => delete next[k]);
      return next;
    });
  }, []);

  // ── Tip selection ─────────────────────────────────────────────────────────
  const handleTipSelect = useCallback(
    (option) => {
      setCustomTip(""); // always reset the custom input field
      if (option.value === "custom") {
        updateBooking({ tipType: "custom", tipAmount: 0 });
      } else if (option.percent !== null) {
        const tipValue =
          Math.round(getPrice() * (option.percent / 100) * 100) / 100;
        updateBooking({ tipType: option.value, tipAmount: tipValue });
      } else {
        updateBooking({ tipType: "none", tipAmount: 0 });
      }
    },
    [getPrice, updateBooking]
  );

  const handleCustomTipChange = useCallback(
    (e) => {
      const raw = e.target.value;
      setCustomTip(raw);
      const parsed = parseFloat(raw);
      updateBooking({
        tipAmount: !isNaN(parsed) && parsed >= 0 ? parsed : 0,
      });
    },
    [updateBooking]
  );

  // ── Step 4 validation ─────────────────────────────────────────────────────
  const validateStep4 = useCallback(() => {
    const newErrors = {};
    if (booking.ownerName.trim().length < 2) {
      newErrors.ownerName = "Name must be at least 2 characters.";
    }
    if (booking.dogName.trim().length < 1) {
      newErrors.dogName = "Dog name is required.";
    }
    if (!isValidPhone(booking.phone)) {
      newErrors.phone =
        "Enter a valid phone number (e.g., 555-867-5309).";
    }
    if (!isValidEmail(booking.email)) {
      newErrors.email = "Enter a valid email address.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [booking.ownerName, booking.dogName, booking.phone, booking.email]);

  // ── Booking submission ────────────────────────────────────────────────────
  const submitBooking = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const baseUrl =
        process.env.REACT_APP_BACKEND_URL ||
        process.env.VITE_BACKEND_URL ||
        "";
      const { data } = await axios.post(`${baseUrl}/api/bookings`, {
        service: booking.service?.id,
        dogSize: booking.dogSize?.id,
        date: booking.date ? format(booking.date, "yyyy-MM-dd") : null,
        time: booking.time,
        ownerName: booking.ownerName.trim(),
        dogName: booking.dogName.trim(),
        phone: booking.phone.trim(),
        email: booking.email.trim() || null,
        notes: booking.notes.trim() || null,
        tipType: booking.tipType,
        tipAmount: booking.tipAmount,
        totalAmount,
      });
      updateBooking({ confirmationNumber: data.confirmationNumber });
      goNext();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Booking failed. Please try again or call us directly.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [booking, totalAmount, updateBooking, goNext]);

  // ── Progress indicator ────────────────────────────────────────────────────
  const TOTAL_STEPS = 5; // steps 1-5; step 6 is the success screen
  const progressPercent = Math.min(((step - 1) / TOTAL_STEPS) * 100, 100);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* ── Header ── */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">
            Book a Grooming Appointment
          </h1>
          <p className="text-muted-foreground mt-2">
            Fresh Pup – professional dog grooming
          </p>
        </div>

        {/* ── Progress bar (hidden on success screen) ── */}
        {step <= TOTAL_STEPS && (
          <div
            className="mb-6"
            role="progressbar"
            aria-valuenow={step}
            aria-valuemin={1}
            aria-valuemax={TOTAL_STEPS}
            aria-label={`Step ${step} of ${TOTAL_STEPS}`}
          >
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Step {step} of {TOTAL_STEPS}</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            Step 1 – Service selection
        ════════════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <Card data-testid="step-service">
            <CardHeader>
              <CardTitle>Choose a Service</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingServices ? (
                <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Loading services…</span>
                </div>
              ) : services.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No services available right now. Please try again later.
                </p>
              ) : (
                <div className="grid gap-3">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      data-testid={`service-option-${service.id}`}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        booking.service?.id === service.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => updateBooking({ service })}
                      aria-pressed={booking.service?.id === service.id}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{service.name}</p>
                          {service.description && (
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {service.description}
                            </p>
                          )}
                        </div>
                        <p className="font-semibold text-primary ml-4 shrink-0">
                          ${service.price}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={goNext}
                  disabled={!booking.service}
                  data-testid="next-step-1"
                >
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ════════════════════════════════════════════════════════════════
            Step 2 – Dog size selection
        ════════════════════════════════════════════════════════════════ */}
        {step === 2 && (
          <Card data-testid="step-dog-size">
            <CardHeader>
              <CardTitle>Dog Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {DOG_SIZES.map((size) => (
                  <button
                    key={size.id}
                    data-testid={`size-option-${size.id}`}
                    className={`p-4 rounded-lg border-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      booking.dogSize?.id === size.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => updateBooking({ dogSize: size })}
                    aria-pressed={booking.dogSize?.id === size.id}
                  >
                    <p className="font-medium">{size.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {size.description}
                    </p>
                    {size.priceModifier > 0 && (
                      <p className="text-xs text-primary font-medium mt-1">
                        +${size.priceModifier}
                      </p>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={goBack}>
                  <ChevronLeft className="mr-1 h-4 w-4" /> Back
                </Button>
                <Button
                  onClick={goNext}
                  disabled={!booking.dogSize}
                  data-testid="next-step-2"
                >
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ════════════════════════════════════════════════════════════════
            Step 3 – Date and time selection
        ════════════════════════════════════════════════════════════════ */}
        {step === 3 && (
          <Card data-testid="step-datetime">
            <CardHeader>
              <CardTitle>Pick a Date &amp; Time</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading calendar…</span>
                  </div>
                }
              >
                <Calendar
                  mode="single"
                  selected={booking.date}
                  onSelect={(date) => updateBooking({ date, time: null })}
                  disabled={isDateDisabled}
                  className="rounded-md border mx-auto"
                  aria-label="Select appointment date"
                />
              </Suspense>

              {booking.date && (
                <div className="mt-6">
                  <p className="text-sm font-medium mb-3">
                    Available times for{" "}
                    <span className="text-primary">
                      {format(booking.date, "EEEE, MMMM d, yyyy")}
                    </span>
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        data-testid={`time-slot-${slot}`}
                        className={`py-2 px-3 rounded-md border text-sm text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          booking.time === slot
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => updateBooking({ time: slot })}
                        aria-pressed={booking.time === slot}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={goBack}>
                  <ChevronLeft className="mr-1 h-4 w-4" /> Back
                </Button>
                <Button
                  onClick={goNext}
                  disabled={!booking.date || !booking.time}
                  data-testid="next-step-3"
                >
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ════════════════════════════════════════════════════════════════
            Step 4 – Customer details
        ════════════════════════════════════════════════════════════════ */}
        {step === 4 && (
          <Card data-testid="step-customer">
            <CardHeader>
              <CardTitle>Your Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {/* Owner name */}
                <div>
                  <label
                    htmlFor="ownerName"
                    className="text-sm font-medium block mb-1"
                  >
                    Your Name <span aria-hidden="true">*</span>
                  </label>
                  <Input
                    id="ownerName"
                    value={booking.ownerName}
                    onChange={(e) => updateBooking({ ownerName: e.target.value })}
                    placeholder="Jane Smith"
                    aria-required="true"
                    aria-describedby={errors.ownerName ? "ownerName-error" : undefined}
                    aria-invalid={!!errors.ownerName}
                    data-testid="input-owner-name"
                  />
                  {errors.ownerName && (
                    <p
                      id="ownerName-error"
                      role="alert"
                      className="text-destructive text-xs mt-1"
                    >
                      {errors.ownerName}
                    </p>
                  )}
                </div>

                {/* Dog name */}
                <div>
                  <label
                    htmlFor="dogName"
                    className="text-sm font-medium block mb-1"
                  >
                    Dog's Name <span aria-hidden="true">*</span>
                  </label>
                  <Input
                    id="dogName"
                    value={booking.dogName}
                    onChange={(e) => updateBooking({ dogName: e.target.value })}
                    placeholder="Buddy"
                    aria-required="true"
                    aria-describedby={errors.dogName ? "dogName-error" : undefined}
                    aria-invalid={!!errors.dogName}
                    data-testid="input-dog-name"
                  />
                  {errors.dogName && (
                    <p
                      id="dogName-error"
                      role="alert"
                      className="text-destructive text-xs mt-1"
                    >
                      {errors.dogName}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="text-sm font-medium block mb-1"
                  >
                    Phone Number <span aria-hidden="true">*</span>
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={booking.phone}
                    onChange={(e) => updateBooking({ phone: e.target.value })}
                    placeholder="555-867-5309"
                    aria-required="true"
                    aria-describedby={errors.phone ? "phone-error" : "phone-hint"}
                    aria-invalid={!!errors.phone}
                    data-testid="input-phone"
                  />
                  <p id="phone-hint" className="text-xs text-muted-foreground mt-1">
                    Format: 555-867-5309 or (555) 867-5309
                  </p>
                  {errors.phone && (
                    <p
                      id="phone-error"
                      role="alert"
                      className="text-destructive text-xs mt-1"
                    >
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Email (optional) */}
                <div>
                  <label
                    htmlFor="email"
                    className="text-sm font-medium block mb-1"
                  >
                    Email{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={booking.email}
                    onChange={(e) => updateBooking({ email: e.target.value })}
                    placeholder="jane@example.com"
                    aria-describedby={errors.email ? "email-error" : undefined}
                    aria-invalid={!!errors.email}
                    data-testid="input-email"
                  />
                  {errors.email && (
                    <p
                      id="email-error"
                      role="alert"
                      className="text-destructive text-xs mt-1"
                    >
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label
                    htmlFor="notes"
                    className="text-sm font-medium block mb-1"
                  >
                    Special Instructions{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </label>
                  <Textarea
                    id="notes"
                    value={booking.notes}
                    onChange={(e) => updateBooking({ notes: e.target.value })}
                    placeholder="Any special requests or information about your dog…"
                    rows={3}
                    data-testid="input-notes"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={goBack}>
                  <ChevronLeft className="mr-1 h-4 w-4" /> Back
                </Button>
                <Button
                  onClick={() => {
                    if (validateStep4()) goNext();
                  }}
                  data-testid="next-step-4"
                >
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ════════════════════════════════════════════════════════════════
            Step 5 – Review & tip
        ════════════════════════════════════════════════════════════════ */}
        {step === 5 && (
          <Card data-testid="step-confirm">
            <CardHeader>
              <CardTitle>Review &amp; Confirm</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Summary */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <SummaryRow label="Service" value={booking.service?.name} />
                <SummaryRow label="Dog Size" value={booking.dogSize?.label} />
                <SummaryRow
                  label="Date"
                  value={
                    booking.date
                      ? format(booking.date, "EEEE, MMMM d, yyyy")
                      : "—"
                  }
                />
                <SummaryRow label="Time" value={booking.time} />
                <SummaryRow label="Owner" value={booking.ownerName} />
                <SummaryRow label="Dog" value={booking.dogName} />
                <SummaryRow label="Phone" value={booking.phone} />
                {booking.email && (
                  <SummaryRow label="Email" value={booking.email} />
                )}
                <div className="border-t pt-2 mt-2 flex justify-between font-medium">
                  <span>Service price</span>
                  <span>${getPrice().toFixed(2)}</span>
                </div>
              </div>

              {/* Tip selection */}
              <div className="mt-6">
                <p className="text-sm font-medium mb-3" id="tip-label">
                  Add a tip for your groomer?
                </p>
                <div
                  className="grid grid-cols-3 sm:grid-cols-5 gap-2"
                  role="group"
                  aria-labelledby="tip-label"
                >
                  {TIP_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      data-testid={`tip-option-${option.value}`}
                      className={`py-2 px-2 rounded-md border text-sm text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        booking.tipType === option.value
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => handleTipSelect(option)}
                      aria-pressed={booking.tipType === option.value}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {/* Custom tip input */}
                {booking.tipType === "custom" && (
                  <div className="mt-3 relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="customTip"
                      type="number"
                      min="0"
                      step="0.01"
                      value={customTip}
                      onChange={handleCustomTipChange}
                      placeholder="0.00"
                      className="pl-8"
                      aria-label="Custom tip amount in dollars"
                      data-testid="input-custom-tip"
                    />
                  </div>
                )}

                {/* Tip & total summary */}
                {booking.tipAmount > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Tip: ${booking.tipAmount.toFixed(2)}
                  </p>
                )}
                <p className="text-lg font-bold mt-3">
                  Total: ${totalAmount.toFixed(2)}
                </p>
              </div>

              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={goBack} disabled={isSubmitting}>
                  <ChevronLeft className="mr-1 h-4 w-4" /> Back
                </Button>
                <Button
                  onClick={submitBooking}
                  disabled={isSubmitting}
                  data-testid="confirm-booking"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Booking…
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ════════════════════════════════════════════════════════════════
            Step 6 – Success screen
        ════════════════════════════════════════════════════════════════ */}
        {step === 6 && (
          <Card data-testid="step-success">
            <CardContent className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Check className="h-8 w-8 text-green-600" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Booking Confirmed!
              </h2>
              <p className="mt-2 text-muted-foreground">
                We'll see{" "}
                <span className="font-medium">{booking.dogName}</span> on{" "}
                {booking.date
                  ? format(booking.date, "MMMM d, yyyy")
                  : ""}{" "}
                at {booking.time}.
              </p>
              {booking.confirmationNumber && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Confirmation #:{" "}
                  <span
                    className="font-mono font-medium text-foreground"
                    aria-label={`Confirmation number ${booking.confirmationNumber}`}
                  >
                    {booking.confirmationNumber}
                  </span>
                </p>
              )}
              <p className="mt-2 text-sm text-muted-foreground">
                A confirmation will be sent to{" "}
                {booking.email || booking.phone}.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate("/")}>Return Home</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep(1);
                    setBooking({
                      service: null,
                      dogSize: null,
                      date: null,
                      time: null,
                      ownerName: "",
                      dogName: "",
                      phone: "",
                      email: "",
                      notes: "",
                      tipType: "none",
                      tipAmount: 0,
                      confirmationNumber: null,
                    });
                    setCustomTip("");
                    setErrors({});
                  }}
                >
                  Book Another Appointment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SummaryRow – small helper rendered only within this file
// ---------------------------------------------------------------------------

function SummaryRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
