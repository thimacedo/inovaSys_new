import { useEffect, useState, useRef } from 'react';

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function Counter({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const { ref, visible } = useReveal();
  const isDecimal = end % 1 !== 0;

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { 
        setCount(end); 
        clearInterval(timer); 
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [visible, end, duration]);

  return (
    <span ref={ref}>
      {isDecimal ? count.toFixed(1) : Math.floor(count)}
      {suffix}
    </span>
  );
}

export function Stats() {
  return (
    <section className="py-24 bg-md-surface border-y border-md-outline/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          {[
            { value: 1.4, suffix: 'k+', label: 'Movimentações Sincronizadas' },
            { value: 100, suffix: '%', label: 'Isolamento RLS' },
            { value: 0.6, suffix: 'ms', label: 'Latência de Sincronização' },
            { value: 24, suffix: 'h', label: 'Suporte Técnico' },
          ].map(stat => (
            <div key={stat.label} className="group">
              <div className="text-4xl sm:text-5xl font-black text-md-primary mb-3">
                <Counter end={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-sm text-md-on-surface-variant font-bold uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
