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

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [visible, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export function Stats() {
  return (
    <section className="py-24 bg-md-surface border-y border-md-outline/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          {[
            { value: 100, suffix: '%', label: 'Focado no Usuário' },
            { value: 5, suffix: '', label: 'Etapas de Gestão' },
            { value: 24, suffix: 'h', label: 'Disponibilidade' },
            { value: 4, suffix: '+', label: 'Integrações' },
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
