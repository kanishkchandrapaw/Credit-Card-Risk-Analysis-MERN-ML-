import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { prediction, formData } = location.state || {};

  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!prediction) {
      navigate('/predict');
      return;
    }
    setTimeout(() => setShowResults(true), 300);
  }, [prediction, navigate]);

  if (!prediction) return null;

  const getCreditScore = (defaultProb) => {
    return Math.round((1 - defaultProb) * 850 + 300);
  };

  const getRiskColor = (defaultProb) => {
    if (defaultProb > 0.7) return { from: '#ef4444', to: '#dc2626', glow: '#ef4444', text: 'text-red-400' };
    if (defaultProb > 0.4) return { from: '#f59e0b', to: '#d97706', glow: '#f59e0b', text: 'text-yellow-400' };
    return { from: '#10b981', to: '#059669', glow: '#10b981', text: 'text-green-400' };
  };

  const creditScore = getCreditScore(prediction.default_probability);
  const riskColors = getRiskColor(prediction.default_probability);
  const defaultPct = (prediction.default_probability * 100).toFixed(1);
  const noDefaultPct = (prediction.no_default_probability * 100).toFixed(1);

  // Calculate scores
  const paymentHistoryScore = parseFloat(noDefaultPct);
  const creditUtilization = Math.min(100, (parseFloat(formData.PAY_AMT1) / parseFloat(formData.BILL_AMT1)) * 100);
  const accountAge = Math.min(100, parseFloat(formData.AGE) * 1.5);
  const paymentConsistency = Math.max(0, 100 - Math.abs(parseFloat(formData.PAY_0) + parseFloat(formData.PAY_2)) * 10);
  const debtRatio = 100 - parseFloat(defaultPct);

  // Animated Counter
  const AnimatedCounter = ({ value, duration = 2000 }) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
      let start = 0;
      const end = parseInt(value);
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }, [value, duration]);

    return <span>{count}</span>;
  };

  // Circular Progress
  const CircularProgress = ({ percentage, size = 180, strokeWidth = 10, color }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id={`gradient-${percentage}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color.from} />
              <stop offset="100%" stopColor={color.to} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1f2937" strokeWidth={strokeWidth} />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke={`url(#gradient-${percentage})`} strokeWidth={strokeWidth}
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round" filter="url(#glow)"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-bold text-white"><AnimatedCounter value={percentage} />%</div>
            <div className="text-xs text-gray-400 mt-1">Confidence</div>
          </div>
        </div>
      </div>
    );
  };

  // Risk Gauge
  const RiskGauge = ({ percentage, color }) => {
    const rotation = (percentage / 100) * 180 - 90;
    
    return (
      <div className="relative w-48 h-24 mx-auto">
        <svg viewBox="0 0 200 100" className="w-full h-full">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          <path d="M 20 90 A 80 80 0 0 1 180 90" fill="none" stroke="#1f2937" strokeWidth="12" strokeLinecap="round" />
          <path d="M 20 90 A 80 80 0 0 1 180 90" fill="none" stroke="url(#gaugeGradient)" strokeWidth="12" strokeLinecap="round" />
          <line x1="100" y1="90" x2="100" y2="30" stroke={color.from} strokeWidth="3" strokeLinecap="round"
            transform={`rotate(${rotation} 100 90)`} className="transition-all duration-1000" filter="url(#glow)" />
          <circle cx="100" cy="90" r="6" fill={color.from} />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 text-center">
          <div className="text-xs text-gray-500 flex justify-between px-4">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
        </div>
      </div>
    );
  };

  // Bar Chart
  const BarChart = ({ data, labels, colors }) => {
    return (
      <div className="space-y-3">
        {data.map((value, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">{labels[index]}</span>
              <span className={`font-bold ${colors[index]}`}>{value}%</span>
            </div>
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-1000"
                style={{ 
                  width: `${value}%`,
                  background: `linear-gradient(90deg, ${colors[index] === 'text-red-400' ? '#ef4444, #dc2626' : colors[index] === 'text-green-400' ? '#10b981, #059669' : '#f59e0b, #d97706'})`
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Radar Chart
  const RadarChart = ({ scores }) => {
    const size = 200;
    const center = size / 2;
    const maxRadius = size / 2 - 20;
    const angles = scores.map((_, i) => (Math.PI * 2 * i) / scores.length - Math.PI / 2);
    
    const points = scores.map((score, i) => {
      const r = (score / 100) * maxRadius;
      return {
        x: center + r * Math.cos(angles[i]),
        y: center + r * Math.sin(angles[i])
      };
    });

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

    return (
      <svg width={size} height={size} className="mx-auto">
        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((scale, i) => (
          <circle key={i} cx={center} cy={center} r={maxRadius * scale} fill="none" stroke="#374151" strokeWidth="1" opacity="0.3" />
        ))}
        {angles.map((angle, i) => (
          <line key={i} x1={center} y1={center} x2={center + maxRadius * Math.cos(angle)} y2={center + maxRadius * Math.sin(angle)}
            stroke="#374151" strokeWidth="1" opacity="0.3" />
        ))}
        <path d={pathData} fill="url(#radarGradient)" stroke="#06b6d4" strokeWidth="2" />
        {points.map((point, i) => (
          <circle key={i} cx={point.x} cy={point.y} r="4" fill="#06b6d4" className="animate-pulse" />
        ))}
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>

      <div className="relative z-10">
        <Navbar />

        <div className="max-w-7xl mx-auto px-6 py-8">
          {showResults && (
            <div className="space-y-8 animate-fadeIn">
              {/* Top Section */}
              <div className="grid grid-cols-3 gap-6">
                {/* Circular Progress */}
                <div className="backdrop-blur-xl bg-gray-900/40 border border-cyan-500/20 rounded-2xl p-6 flex items-center justify-center">
                  <CircularProgress percentage={parseFloat(noDefaultPct)} color={riskColors} />
                </div>

                {/* Credit Score */}
                <div className="col-span-2 backdrop-blur-xl bg-gray-900/40 border border-purple-500/20 rounded-2xl p-6">
                  <p className="text-sm text-gray-400 mb-2">Credit Score</p>
                  <div className="flex items-end justify-between mb-4">
                    <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                      <AnimatedCounter value={creditScore} />
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                      prediction.risk_level === 'High' 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                        : 'bg-green-500/20 text-green-400 border border-green-500/30'
                    }`}>
                      {prediction.risk_level} Risk
                    </div>
                  </div>
                  <RiskGauge percentage={parseFloat(defaultPct)} color={riskColors} />
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-2 gap-6">
                {/* Bar Chart */}
                <div className="backdrop-blur-xl bg-gray-900/40 border border-cyan-500/20 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Risk Factors</span>
                  </h3>
                  <BarChart 
                    data={[parseFloat(defaultPct), parseFloat(noDefaultPct)]}
                    labels={['Default Risk', 'Safe Probability']}
                    colors={[riskColors.text, 'text-green-400']}
                  />
                </div>

                {/* Radar Chart */}
                <div className="backdrop-blur-xl bg-gray-900/40 border border-purple-500/20 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    </svg>
                    <span>Credit Profile</span>
                  </h3>
                  <RadarChart scores={[paymentHistoryScore, creditUtilization, accountAge, paymentConsistency, debtRatio]} />
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-gray-400">
                    <div>• Payment History</div>
                    <div>• Credit Utilization</div>
                    <div>• Account Age</div>
                    <div>• Consistency</div>
                    <div className="col-span-2">• Debt Ratio</div>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'DEFAULT RISK', value: defaultPct, color: 'red' },
                  { label: 'SAFE ZONE', value: noDefaultPct, color: 'green' },
                  { label: 'PREDICTION', value: prediction.prediction === 1 ? 'Default' : 'Safe', color: 'purple', isText: true },
                  { label: 'CONFIDENCE', value: Math.max(defaultPct, noDefaultPct), color: 'blue' }
                ].map((stat, idx) => (
                  <div key={idx} className={`backdrop-blur-xl bg-gradient-to-br from-${stat.color}-500/10 to-${stat.color}-600/5 border border-${stat.color}-500/20 rounded-xl p-4`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`w-2 h-2 bg-${stat.color}-500 rounded-full animate-pulse`}></div>
                      <p className={`text-xs text-${stat.color}-400 font-medium`}>{stat.label}</p>
                    </div>
                    <p className={`text-3xl font-bold text-${stat.color}-400 mb-2`}>
                      {stat.isText ? stat.value : <><AnimatedCounter value={stat.value} />%</>}
                    </p>
                    {!stat.isText && (
                      <div className="w-full bg-gray-800 rounded-full h-1.5">
                        <div className={`bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-600 h-1.5 rounded-full transition-all duration-1000`}
                          style={{ width: `${stat.value}%` }}></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* AI Recommendation */}
              <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
                prediction.risk_level === 'High' ? 'bg-red-500/5 border-red-500/30' : 'bg-green-500/5 border-green-500/30'
              }`}>
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl ${prediction.risk_level === 'High' ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                    <svg className={`w-6 h-6 ${prediction.risk_level === 'High' ? 'text-red-400' : 'text-green-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">AI Recommendation</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {prediction.risk_level === 'High' 
                        ? '⚠️ High-risk profile detected. Recommend enhanced verification, additional collateral, or risk-adjusted pricing with premium interest rates.'
                        : '✅ Low-risk profile confirmed. Customer demonstrates excellent payment behavior and creditworthiness. Approve with standard terms.'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="text-center">
                <button
                  onClick={() => navigate('/predict')}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  ← Make Another Prediction
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
};

export default Results;
