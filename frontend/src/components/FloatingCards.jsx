const FloatingCards = () => {
  const cards = [
    { name: 'visa', color: 'from-blue-600 to-blue-800', delay: '0s' },
    { name: 'mastercard', color: 'from-red-600 to-orange-600', delay: '2s' },
    { name: 'amex', color: 'from-cyan-600 to-blue-700', delay: '4s' },
    { name: 'discover', color: 'from-orange-500 to-yellow-600', delay: '6s' },
    { name: 'jcb', color: 'from-green-600 to-emerald-700', delay: '8s' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {cards.map((card, index) => (
        <div
          key={card.name}
          className="absolute w-72 h-44 rounded-2xl shadow-2xl opacity-20"
          style={{
            left: `${(index * 20) % 100}%`,
            top: `${(index * 15) % 80}%`,
            animation: `float 20s ease-in-out infinite`,
            animationDelay: card.delay,
          }}
        >
          <div className={`w-full h-full rounded-2xl bg-gradient-to-br ${card.color} p-6 flex flex-col justify-between backdrop-blur-sm`}>
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-lg bg-yellow-400 opacity-80"></div>
              <div className="text-white font-bold text-xl uppercase">{card.name}</div>
            </div>
            <div className="space-y-3">
              <div className="flex gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-1">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="w-2 h-2 rounded-full bg-white"></div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="text-white text-sm">VALID THRU 12/27</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FloatingCards;
