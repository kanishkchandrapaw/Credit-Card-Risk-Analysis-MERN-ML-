// Predict.jsx
import React, { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from "axios";

/**
 * Particles: lazy loaded to avoid adding cost to initial bundle.
 * We import tsparticles-slim only when initializing to keep bundle light.
 */
const Particles = React.lazy(() => import("react-tsparticles"));

/* -------------------------------------------------------------------------- */
/*                                 Form Data                                  */
/* -------------------------------------------------------------------------- */
const initialFormData = {
  LIMIT_BAL: "",
  SEX: "",
  EDUCATION: "",
  MARRIAGE: "",
  AGE: "",
  PAY_0: "",
  PAY_2: "",
  PAY_3: "",
  PAY_4: "",
  PAY_5: "",
  PAY_6: "",
  BILL_AMT1: "",
  BILL_AMT2: "",
  BILL_AMT3: "",
  BILL_AMT4: "",
  BILL_AMT5: "",
  BILL_AMT6: "",
  PAY_AMT1: "",
  PAY_AMT2: "",
  PAY_AMT3: "",
  PAY_AMT4: "",
  PAY_AMT5: "",
  PAY_AMT6: "",
};

/* -------------------------------------------------------------------------- */
/*                               Field Details                                 */
/* -------------------------------------------------------------------------- */
const baseFieldDetails = [
  {
    key: "LIMIT_BAL",
    label: "Credit Limit (₹)",
    desc: "Total credit available for this customer.",
    placeholder: "Example: 150000",
    type: "number",
  },
  {
    key: "SEX",
    label: "Gender",
    desc: "Customer's official gender as per bank records.",
    type: "select",
    options: [
      { value: 1, label: "Male" },
      { value: 2, label: "Female" },
    ],
  },
  {
    key: "EDUCATION",
    label: "Education Level",
    desc: "Highest education completed.",
    type: "select",
    options: [
      { value: 1, label: "Graduate School" },
      { value: 2, label: "University" },
      { value: 3, label: "High School" },
      { value: 4, label: "Other" },
    ],
  },
  {
    key: "MARRIAGE",
    label: "Marital Status",
    desc: "Marital status as per submitted documents.",
    type: "select",
    options: [
      { value: 1, label: "Married" },
      { value: 2, label: "Single" },
      { value: 3, label: "Other" },
    ],
  },
  {
    key: "AGE",
    label: "Customer Age (years)",
    desc: "Current age of the customer in years.",
    placeholder: "Example: 34",
    type: "number",
  },
];

const generateFieldDetails = () => {
  const payStatus = ["PAY_0", "PAY_2", "PAY_3", "PAY_4", "PAY_5", "PAY_6"].map(
    (key, i) => ({
      key,
      label:
        i === 0
          ? "Payment Status (this month)"
          : `Payment Status (${i + 1} months ago)`,
      desc:
        "Repayment status (-1: paid duly, 0: minimal due, >0: months delayed).",
      placeholder: "-1/0/1/2",
      type: "number",
    })
  );

  const bills = Array.from({ length: 6 }, (_, n) => {
    const i = n + 1;
    return {
      key: `BILL_AMT${i}`,
      label: `Bill Amount ${i} month${i === 1 ? "" : "s"} ago (₹)`,
      desc: `Statement bill ${i} month${i === 1 ? "" : "s"} ago.`,
      placeholder: "e.g. 32000",
      type: "number",
    };
  });

  const pays = Array.from({ length: 6 }, (_, n) => {
    const i = n + 1;
    return {
      key: `PAY_AMT${i}`,
      label: `Payment Made ${i} month${i === 1 ? "" : "s"} ago (₹)`,
      desc: `Amount paid ${i} month${i === 1 ? "" : "s"} ago.`,
      placeholder: "e.g. 2500",
      type: "number",
    };
  });

  return [...baseFieldDetails, ...payStatus, ...bills, ...pays];
};

const fieldDetails = generateFieldDetails();

/* -------------------------------------------------------------------------- */
/*                              Small reusable Field                          */
/* -------------------------------------------------------------------------- */
const Field = React.memo(function Field({ f, value, onChange }) {
  // keep inputs simple and avoid inline object recreation
  return (
    <div className="form-field mb-1">
      <label className="block text-cyan-100 font-semibold mb-0.5">
        {f.label}
      </label>
      <span className="block text-xs text-cyan-200 mb-1">{f.desc}</span>

      {f.type === "select" ? (
        <select
          name={f.key}
          value={value}
          onChange={onChange}
          required
          className="form-input w-full bg-[#0f1112] border border-cyan-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-white shadow-inner focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
        >
          <option value="">Select...</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          name={f.key}
          type={f.type}
          value={value}
          onChange={onChange}
          step="any"
          min={0}
          placeholder={f.placeholder}
          className="form-input w-full bg-[#0f1112] border border-cyan-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-cyan-100 shadow-inner focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          required
        />
      )}
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/*                              Main Component                                 */
/* -------------------------------------------------------------------------- */
const Predict = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ripple, setRipple] = useState(null);
  const [enableParticles, setEnableParticles] = useState(false);

  // detect low-power / low-memory and user preference for reduced motion
  useEffect(() => {
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const deviceMemory = navigator.deviceMemory || 4; // fallback
    // enable particles only on decent devices and when user doesn't prefer reduced motion
    setEnableParticles(!prefersReduced && deviceMemory >= 2);
  }, []);

  /* --------------------------- Keyboard shortcuts -------------------------- */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setFormData(initialFormData);
        setError("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // passive scroll listeners for performance (no heavy work inside)
  useEffect(() => {
    const handleScroll = () => {};
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("touchmove", handleScroll, { passive: true });
    window.addEventListener("wheel", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("touchmove", handleScroll);
      window.removeEventListener("wheel", handleScroll);
    };
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      // avoid recreating whole object unless value changed
      if (prev[name] === value) return prev;
      return { ...prev, [name]: value };
    });
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      setError("");

      // Build payload with a fast for loop.
      const payload = {};
      for (let i = 0; i < Object.keys(formData).length; i++) {
        const k = Object.keys(formData)[i];
        const v = formData[k];
        const fDef = fieldDetails.find((f) => f.key === k);
        if (v === "") {
          payload[k] = 0;
        } else if (fDef && fDef.type === "select") {
          payload[k] = parseInt(v, 10);
        } else {
          payload[k] = parseFloat(v);
        }
      }

      try {
        const response = await axios.post("https://credit-card-risk-analysis-mern-ml-1.onrender.com/predict", payload);
        navigate("/results", {
          state: { prediction: response.data, formData: payload },
        });
      } catch (err) {
        setError("Prediction failed. Please check your inputs and try again.");
      } finally {
        setLoading(false);
      }
    },
    [formData, navigate]
  );

  const handleRipple = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    // shorter ripple life for perf
    window.setTimeout(() => setRipple(null), 420);
  }, []);

  // particles init: dynamically import loadSlim to keep initial bundle light
  const particlesInit = useCallback(async (engine) => {
    try {
      const mod = await import("tsparticles-slim");
      await mod.loadSlim(engine);
    } catch (err) {
      // ignore if unable to load
      // particles will simply not render
    }
  }, []);

  // lightweight particle options (kept minimal)
  const particlesOptions = useMemo(
    () => ({
      background: { color: { value: "transparent" } },
      fpsLimit: 60,
      particles: {
        number: { value: 14, density: { enable: true, area: 1500 } },
        color: { value: ["#26fff7", "#bd4fdb", "#ffffff"] },
        shape: { type: "circle" },
        opacity: { value: 0.06, random: true },
        size: { value: 1, random: true },
        move: {
          enable: true,
          speed: 0.2,
          direction: "none",
          outModes: "out",
        },
      },
      interactivity: {
        events: {
          onHover: { enable: false },
          onClick: { enable: false },
          resize: true,
        },
      },
      detectRetina: true,
    }),
    []
  );

  // memoized container style (avoid inline recreation on every render)
  const formStyle = useMemo(
    () => ({
      background: "linear-gradient(120deg, rgba(36,40,85,0.97) 65%, rgba(24,29,35,0.95) 100%)",
      border: "1.5px solid rgba(47,230,218,0.19)",
    }),
    []
  );

  return (
    <>
      <style>{`
        /* Lightweight global resets */
        * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; box-sizing: border-box; }
        html,body,#root { height: 100%; width: 100%; margin:0; padding:0; overflow-x:hidden; }
        body { background: #05060a; color: #e6eef6; -webkit-tap-highlight-color: transparent; }

        /* Basic layout */
        .predict-container { min-height:100vh; width:100%; display:flex; flex-direction:column; align-items:center; justify-content:flex-start; overflow-x:hidden; }
        .particle-canvas { pointer-events:none; }

        /* Keep background decorative but static for perf */
        .bg-static {
          position: fixed;
          inset: 0;
          background: linear-gradient(180deg, rgba(10,13,20,0.55), rgba(6,8,10,0.65));
          z-index: 0;
          pointer-events: none;
        }

        /* Reduced ripple for performance */
        .ripple {
          position: absolute;
          border-radius: 50%;
          transform: translate3d(-50%,-50%,0);
          pointer-events: none;
          background: radial-gradient(circle, rgba(125,211,252,0.14) 0%, rgba(125,211,252,0) 60%);
          animation: rippleFast 420ms cubic-bezier(0.4,0,0.2,1) forwards;
          mix-blend-mode: screen;
          will-change: width,height,opacity;
        }
        @keyframes rippleFast {
          from { width: 0; height: 0; opacity: 0.7; }
          to { width: 240px; height: 240px; opacity: 0; }
        }

        /* Simple, non-animated CTA sheen (no continuous animation) */
        .cta::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 60%);
          opacity: 0.8;
          pointer-events: none;
          transform: translate3d(-30%,0,0);
        }

        /* Form */
        .form-container { border-radius: 1rem; padding: 1.75rem; max-width: 70rem; margin: 3.25rem auto; z-index: 10; }

        /* Reduce animation complexity for accessibility */
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <div className="predict-container">
        {/* Particles (lazy) */}
        {enableParticles && (
          <Suspense fallback={null}>
            <Particles
              id="tsparticles"
              init={particlesInit}
              options={particlesOptions}
              className="particle-canvas fixed inset-0 z-0"
            />
          </Suspense>
        )}

        <div className="bg-static" />

        {/* Navbar */}
        <div style={{ position: "sticky", top: 0, zIndex: 40, width: "100%" }}>
          <Navbar />
        </div>

        {/* Form */}
        <div className="relative z-10 w-full flex items-center justify-center">
          <form
            onSubmit={handleSubmit}
            className="form-container glass-gradient shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5"
            style={formStyle}
          >
            {fieldDetails.map((f) => (
              <Field
                key={f.key}
                f={f}
                value={formData[f.key]}
                onChange={handleChange}
              />
            ))}

            {error && (
              <div className="col-span-2 p-2 bg-red-100/10 text-red-300 rounded text-center">
                {error}
              </div>
            )}

            <div className="col-span-2 flex justify-center">
              <button
                type="submit"
                disabled={loading}
                onClick={handleRipple}
                className="cta relative overflow-hidden w-full md:w-1/2 py-3 font-bold rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-cyan-400/90 via-fuchsia-500/80 to-purple-700/80 text-white shadow-lg hover:scale-105 focus:outline-none transition-transform duration-150"
              >
                {/* Ripple effect */}
                {ripple && (
                  <span
                    className="ripple"
                    style={{ left: ripple.x, top: ripple.y }}
                  />
                )}

                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? "Analyzing..." : "🚀 Predict Default Risk"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Predict;
