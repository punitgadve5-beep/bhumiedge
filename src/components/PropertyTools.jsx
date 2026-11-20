import { useMemo, useState } from "react";

const AREA_RATES_IN_SQFT = {
  sqft: { label: "Square Feet (Sq.ft)", factor: 1 },
  sqm: { label: "Square Meter (Sq.m)", factor: 10.7639104 },
  sqyd: { label: "Square Yard / Gaj", factor: 9 },
  acre: { label: "Acre", factor: 43560 },
  hectare: { label: "Hectare", factor: 107639.104 },
  bigha: { label: "Bigha (Standard)", factor: 27225 },
  decimal: { label: "Decimal / Dismil", factor: 435.6 },
};

const formatINR = (num) =>
  Math.round(Number(num) || 0).toLocaleString("en-IN");

export default function PropertyTools() {
  const [activeTab, setActiveTab] = useState("area");

  // Land Area Converter State
  const [areaValue, setAreaValue] = useState("1000");
  const [fromUnit, setFromUnit] = useState("sqft");

  // EMI & Stamp Duty State
  const [propertyPrice, setPropertyPrice] = useState("2500000");
  const [downPaymentPercent, setDownPaymentPercent] = useState("20");
  const [interestRate, setInterestRate] = useState("8.5");
  const [tenureYears, setTenureYears] = useState("20");
  const [stampDutyPercent, setStampDutyPercent] = useState("7.5");

  // Area Conversions
  const convertedAreas = useMemo(() => {
    const val = parseFloat(areaValue);
    if (!Number.isFinite(val) || val < 0) return [];
    const baseSqft = val * AREA_RATES_IN_SQFT[fromUnit].factor;

    return Object.entries(AREA_RATES_IN_SQFT).map(([key, info]) => {
      const converted = baseSqft / info.factor;
      return {
        key,
        label: info.label,
        value:
          converted >= 100
            ? converted.toLocaleString("en-IN", { maximumFractionDigits: 2 })
            : converted.toLocaleString("en-IN", { maximumFractionDigits: 4 }),
      };
    });
  }, [areaValue, fromUnit]);

  // EMI & Registry Calculations
  const financeSummary = useMemo(() => {
    const price = Math.max(0, Number(propertyPrice) || 0);
    const dpPct = Math.min(90, Math.max(0, Number(downPaymentPercent) || 0));
    const rate = Math.max(0, Number(interestRate) || 0);
    const years = Math.max(1, Number(tenureYears) || 1);
    const stampPct = Math.max(0, Number(stampDutyPercent) || 0);

    const downPayment = (price * dpPct) / 100;
    const loanAmount = Math.max(0, price - downPayment);
    const monthlyRate = rate / 12 / 100;
    const months = years * 12;

    let emi = 0;
    if (loanAmount > 0) {
      if (monthlyRate === 0) {
        emi = loanAmount / months;
      } else {
        const factor = Math.pow(1 + monthlyRate, months);
        emi = (loanAmount * monthlyRate * factor) / (factor - 1);
      }
    }

    const totalPayable = emi * months;
    const totalInterest = Math.max(0, totalPayable - loanAmount);
    const stampDuty = (price * stampPct) / 100;
    const registrationFee = (price * 1) / 100; // Approx 1% registration

    return {
      downPayment,
      loanAmount,
      emi,
      totalInterest,
      stampDuty,
      registrationFee,
      totalRegistryCost: stampDuty + registrationFee,
    };
  }, [
    propertyPrice,
    downPaymentPercent,
    interestRate,
    tenureYears,
    stampDutyPercent,
  ]);

  return (
    <section className="tools-section" id="tools">
      <style>{`
        .tools-section {
          padding: 4.5rem 6%;
          background: #f4f8f5;
          border-top: 1px solid #e2ece5;
          border-bottom: 1px solid #e2ece5;
        }
        .tools-container {
          max-width: 1050px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
          overflow: hidden;
        }
        .tools-tabs {
          display: flex;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }
        .tools-tab-btn {
          flex: 1;
          padding: 1.1rem;
          border: none;
          background: transparent;
          font-size: 1rem;
          font-weight: 700;
          color: #4b5563;
          cursor: pointer;
          transition: all 0.2s ease;
          border-bottom: 3px solid transparent;
        }
        .tools-tab-btn.active {
          color: #14532d;
          background: #ffffff;
          border-bottom-color: #15803d;
        }
        .tools-body {
          padding: 2rem;
        }
        .tools-input-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .tool-field label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.4rem;
        }
        .tool-field input,
        .tool-field select {
          width: 100%;
          padding: 0.75rem 0.9rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
        }
        .area-results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 0.9rem;
        }
        .area-result-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 0.9rem 1rem;
        }
        .area-result-card.highlight {
          background: #ecfdf5;
          border-color: #6ee7b7;
        }
        .area-result-card span {
          display: block;
          font-size: 0.8rem;
          color: #64748b;
        }
        .area-result-card strong {
          display: block;
          font-size: 1.15rem;
          color: #0f172a;
          margin-top: 4px;
        }
        .finance-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 2rem;
          align-items: start;
        }
        .finance-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .finance-summary-box {
          background: #14532d;
          color: #ffffff;
          border-radius: 14px;
          padding: 1.6rem;
        }
        .finance-summary-box small {
          color: #bbf7d0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }
        .finance-emi-value {
          font-size: 2rem;
          font-weight: 800;
          margin: 0.35rem 0 1.2rem;
          color: #ffffff;
        }
        .finance-row {
          display: flex;
          justify-content: space-between;
          padding: 0.55rem 0;
          border-top: 1px solid rgba(255, 255, 255, 0.15);
          font-size: 0.92rem;
        }
        @media (max-width: 768px) {
          .tools-input-row,
          .finance-grid,
          .finance-inputs {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="section-heading">
        <span>SMART PROPERTY TOOLS</span>
        <h2>Land Area &amp; Cost Calculators</h2>
        <p>
          Convert land measurements and estimate your loan EMI &amp; registry
          charges instantly.
        </p>
      </div>

      <div className="tools-container">
        <div className="tools-tabs">
          <button
            type="button"
            className={`tools-tab-btn ${activeTab === "area" ? "active" : ""}`}
            onClick={() => setActiveTab("area")}
          >
            📐 Land Area Converter
          </button>
          <button
            type="button"
            className={`tools-tab-btn ${activeTab === "emi" ? "active" : ""}`}
            onClick={() => setActiveTab("emi")}
          >
            🏦 EMI &amp; Stamp Duty Estimator
          </button>
        </div>

        <div className="tools-body">
          {activeTab === "area" ? (
            <>
              <div className="tools-input-row">
                <div className="tool-field">
                  <label>Enter Land Area</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={areaValue}
                    onChange={(e) => setAreaValue(e.target.value)}
                    placeholder="Enter value"
                  />
                </div>

                <div className="tool-field">
                  <label>Select Unit</label>
                  <select
                    value={fromUnit}
                    onChange={(e) => setFromUnit(e.target.value)}
                  >
                    {Object.entries(AREA_RATES_IN_SQFT).map(([key, info]) => (
                      <option key={key} value={key}>
                        {info.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="area-results-grid">
                {convertedAreas.map((item) => (
                  <div
                    key={item.key}
                    className={`area-result-card ${
                      item.key === fromUnit ? "highlight" : ""
                    }`}
                  >
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="finance-grid">
              <div className="finance-inputs">
                <div className="tool-field" style={{ gridColumn: "1 / -1" }}>
                  <label>Property Value (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={propertyPrice}
                    onChange={(e) => setPropertyPrice(e.target.value)}
                  />
                </div>

                <div className="tool-field">
                  <label>Down Payment (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={downPaymentPercent}
                    onChange={(e) => setDownPaymentPercent(e.target.value)}
                  />
                </div>

                <div className="tool-field">
                  <label>Interest Rate (% p.a.)</label>
                  <input
                    type="number"
                    min="1"
                    max="25"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                  />
                </div>

                <div className="tool-field">
                  <label>Loan Tenure (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={tenureYears}
                    onChange={(e) => setTenureYears(e.target.value)}
                  />
                </div>

                <div className="tool-field">
                  <label>Stamp Duty (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    step="0.5"
                    value={stampDutyPercent}
                    onChange={(e) => setStampDutyPercent(e.target.value)}
                  />
                </div>
              </div>

              <div className="finance-summary-box">
                <small>Estimated Monthly EMI</small>
                <div className="finance-emi-value">
                  ₹{formatINR(financeSummary.emi)}/mo
                </div>

                <div className="finance-row">
                  <span>Loan Amount:</span>
                  <b>₹{formatINR(financeSummary.loanAmount)}</b>
                </div>
                <div className="finance-row">
                  <span>Total Interest:</span>
                  <b>₹{formatINR(financeSummary.totalInterest)}</b>
                </div>
                <div className="finance-row">
                  <span>Est. Stamp Duty ({stampDutyPercent}%):</span>
                  <b>₹{formatINR(financeSummary.stampDuty)}</b>
                </div>
                <div className="finance-row">
                  <span>Est. Registration (~1%):</span>
                  <b>₹{formatINR(financeSummary.registrationFee)}</b>
                </div>
                <div
                  className="finance-row"
                  style={{ color: "#fde047", fontWeight: 700 }}
                >
                  <span>Total Govt. Registry Cost:</span>
                  <span>₹{formatINR(financeSummary.totalRegistryCost)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}