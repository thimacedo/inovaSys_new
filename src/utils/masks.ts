export const Masks = {
  doc: (v: string) => {
    v = v.replace(/\D/g, "");
    if (v.length <= 11) {
      v = v.replace(/(\d{3})(\d)/, "$1.$2");
      v = v.replace(/(\d{3})(\d)/, "$1.$2");
      v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      return v;
    } else {
      v = v.replace(/^(\d{2})(\d)/, "$1.$2");
      v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
      v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
      v = v.replace(/(\d{4})(\d)/, "$1-$2");
      return v.substring(0, 18);
    }
  },
  money: (v: string | number) => {
    if (typeof v === 'number') v = (v * 100).toFixed(0);
    v = String(v).replace(/\D/g, "");
    return "R$ " + (Number(v) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  },
  phone: (v: string) => {
    v = v.replace(/\D/g, "");
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    if (v.length <= 13) {
      v = v.replace(/(\d{4})(\d)/, "$1-$2");
    } else {
      v = v.replace(/(\d{5})(\d)/, "$1-$2");
    }
    return v.substring(0, 15);
  },
  cep: (v: string) => {
    v = v.replace(/\D/g, "");
    v = v.replace(/(\d{5})(\d)/, "$1-$2");
    return v.substring(0, 9);
  }
};

export const applyMask = (value: string, maskType: 'doc' | 'money' | 'phone' | 'cep') => {
  return Masks[maskType](value);
};

export const parseMoney = (value: string): number => {
  let vRaw = value.replace('R$ ', '').replace(/\./g, '').replace(',', '.').trim();
  return vRaw ? parseFloat(vRaw) : 0;
};
