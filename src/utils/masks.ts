export const Masks = {
  doc: (v: string) => {
    v = v.replace(/\D/g, "");
    if (v.length <= 11) return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  },
  money: (v: string | number) => {
    if (typeof v === 'number') v = (v * 100).toFixed(0);
    v = String(v).replace(/\D/g, "");
    return "R$ " + (Number(v) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  },
  phone: (v: string) => {
    v = v.replace(/\D/g, "");
    if (v.length <= 10) return v.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    return v.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  },
  cep: (v: string) => {
    v = v.replace(/\D/g, "");
    return v.replace(/(\d{5})(\d{3})/, "$1-$2");
  }
};

export const applyMask = (value: string, maskType: 'doc' | 'money' | 'phone' | 'cep') => {
  return Masks[maskType](value);
};

export const parseMoney = (value: string): number => {
  let vRaw = value.replace('R$ ', '').replace(/\./g, '').replace(',', '.').trim();
  return vRaw ? parseFloat(vRaw) : 0;
};
