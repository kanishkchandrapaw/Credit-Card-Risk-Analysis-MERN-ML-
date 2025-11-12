import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const [stats, setStats] = useState({
    defaultRiskScore: 68,
    accountsMonitored: 12847,
    modelAccuracy: 94,
    apiResponse: 127
  });

  const [trendData] = useState([
    { month: 'Jan', value: 45 },
    { month: 'Feb', value: 52 },
    { month: 'Mar', value: 48 },
    { month: 'Apr', value: 61 },
    { month: 'May', value: 55 },
    { month: 'Jun', value: 67 },
    { month: 'Jul', value: 70 },
    { month: 'Aug', value: 65 },
    { month: 'Sep', value: 72 },
    { month: 'Oct', value: 68 },
    { month: 'Nov', value: 64 },
    { month: 'Dec', value: 71 }
  ]);

  const [insights] = useState([
    { text: 'Payment delay patterns increasing by 23% this quarter', time: 'Live', isLive: true },
    { text: 'ML model achieved 96.2% precision on latest batch', time: 'Live', isLive: true },
    { text: 'Credit utilization > 80% strongly correlates with default', time: 'Live', isLive: true }
  ]);

  const [activities] = useState([
    { text: 'High risk alert triggered for Account #4821', time: '2 min ago', icon: '⚠️', color: 'red' },
    { text: 'Model retrained with 2,341 new samples', time: '15 min ago', icon: '🔄', color: 'blue' },
    { text: 'API latency spike detected (342ms)', time: '1 hour ago', icon: '📊', color: 'yellow' }
  ]);

  // Animated Counter
  const AnimatedCounter = ({ value, duration = 2000, suffix = '' }) => {
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

    return <span>{count.toLocaleString()}{suffix}</span>;
  };

  // Line Chart Component
  const LineChart = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const chartHeight = 200;
    const chartWidth = 800;
    const padding = 40;

    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * (chartWidth - padding * 2) + padding;
      const y = chartHeight - ((d.value / maxValue) * (chartHeight - padding * 2)) - padding;
      return { x, y, value: d.value, month: d.month };
    });

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((val) => (
          <line
            key={val}
            x1={padding}
            y1={chartHeight - ((val / 100) * (chartHeight - padding * 2)) - padding}
            x2={chartWidth - padding}
            y2={chartHeight - ((val / 100) * (chartHeight - padding * 2)) - padding}
            stroke="#374151"
            strokeWidth="1"
            opacity="0.3"
          />
        ))}

        {/* Area under line */}
        <path
          d={`${pathData} L ${chartWidth - padding} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`}
          fill="url(#areaGradient)"
        />

        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill="#06b6d4" className="hover:r-7 transition-all" />
            <circle cx={p.x} cy={p.y} r="5" fill="#06b6d4" opacity="0.5">
              <animate attributeName="r" from="5" to="15" dur="2s" begin="0s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.5" to="0" dur="2s" begin="0s" repeatCount="indefinite" />
            </circle>
          </g>
        ))}

        {/* X-axis labels */}
        {points.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={chartHeight - 10}
            textAnchor="middle"
            className="text-xs fill-gray-400"
          >
            {p.month}
          </text>
        ))}

        {/* Y-axis labels */}
        {[0, 25, 50, 75, 100].map((val) => (
          <text
            key={val}
            x={padding - 10}
            y={chartHeight - ((val / 100) * (chartHeight - padding * 2)) - padding + 5}
            textAnchor="end"
            className="text-xs fill-gray-400"
          >
            {val}
          </text>
        ))}
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Grid Background */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>

      <div className="relative z-10">
        <Navbar />

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Default Risk Score */}
            <div className="backdrop-blur-xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-2xl p-6 hover:border-red-500/40 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-400">Default Risk Score</p>
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                <AnimatedCounter value={stats.defaultRiskScore} />
              </div>
              <div className="flex items-center text-sm">
                <span className="text-red-400">↓ 3.2%</span>
                <span className="text-gray-500 ml-2">vs last month</span>
              </div>
            </div>

            {/* Accounts Monitored */}
            <div className="backdrop-blur-xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-500/40 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-400">Accounts Monitored</p>
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                <AnimatedCounter value={stats.accountsMonitored} />
              </div>
              <div className="flex items-center text-sm">
                <span className="text-green-400">↑ 8.5%</span>
                <span className="text-gray-500 ml-2">vs last month</span>
              </div>
            </div>

            {/* Model Accuracy */}
            <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-2xl p-6 hover:border-green-500/40 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-400">Model Accuracy</p>
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                <AnimatedCounter value={stats.modelAccuracy} suffix="%" />
              </div>
              <div className="flex items-center text-sm">
                <span className="text-green-400">↑ 1.2%</span>
                <span className="text-gray-500 ml-2">vs last month</span>
              </div>
            </div>

            {/* API Response */}
            <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-400">API Response</p>
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                <AnimatedCounter value={stats.apiResponse} suffix="ms" />
              </div>
              <div className="flex items-center text-sm">
                <span className="text-green-400">↓ 5.8%</span>
                <span className="text-gray-500 ml-2">vs last month</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Risk Trend Analysis - Takes 2 columns */}
            <div className="lg:col-span-2 backdrop-blur-xl bg-gray-900/40 border border-purple-500/20 rounded-3xl p-8 hover:border-purple-500/40 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Risk Trend Analysis</h3>
                  <p className="text-sm text-gray-400">Monthly default risk scores across portfolio</p>
                </div>
                <div className="px-4 py-2 bg-cyan-500/20 rounded-lg border border-cyan-500/50">
                  <span className="text-cyan-400 font-semibold">2024</span>
                </div>
              </div>
              <div className="mt-6">
                <LineChart data={trendData} />
              </div>
            </div>

            {/* ML Insights & Activity - Takes 1 column */}
            <div className="space-y-6">
              {/* ML Insights */}
              <div className="backdrop-blur-xl bg-gray-900/40 border border-cyan-500/20 rounded-3xl p-6 hover:border-cyan-500/40 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <h3 className="text-xl font-bold text-white">ML Insights</h3>
                  <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded animate-pulse">
                    Live
                  </span>
                </div>
                <div className="space-y-3">
                  {insights.map((insight, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl hover:border-cyan-500/40 transition-all duration-300"
                    >
                      <p className="text-sm text-gray-300">{insight.text}</p>
                    </div>
                  ))}
                  <button className="w-full py-2 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors flex items-center justify-center space-x-2">
                    <span>View All Insights</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="backdrop-blur-xl bg-gray-900/40 border border-purple-500/20 rounded-3xl p-6 hover:border-purple-500/40 transition-all duration-300">
                <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3 bg-gray-800/50 rounded-xl hover:bg-gray-800/70 transition-all duration-300"
                    >
                      <div className={`text-2xl ${
                        activity.color === 'red' ? 'text-red-400' :
                        activity.color === 'blue' ? 'text-blue-400' :
                        'text-yellow-400'
                      }`}>
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-300">{activity.text}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
