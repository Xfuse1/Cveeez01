export type PhoneNumberLengthInfo = { min: number; max: number; typical: number };

export const phoneNumberLengths: Record<string, PhoneNumberLengthInfo> = {
  "+1": { min: 10, max: 10, typical: 10 }, // USA, Canada
  "+7": { min: 10, max: 10, typical: 10 }, // Russia
  "+20": { min: 10, max: 10, typical: 10 }, // Egypt
  "+27": { min: 9, max: 9, typical: 9 }, // South Africa
  "+30": { min: 10, max: 10, typical: 10 }, // Greece
  "+31": { min: 9, max: 9, typical: 9 }, // Netherlands
  "+32": { min: 8, max: 9, typical: 9 }, // Belgium
  "+33": { min: 9, max: 9, typical: 9 }, // France
  "+34": { min: 9, max: 9, typical: 9 }, // Spain
  "+39": { min: 9, max: 10, typical: 10 }, // Italy
  "+41": { min: 9, max: 9, typical: 9 }, // Switzerland
  "+44": { min: 10, max: 10, typical: 10 }, // UK
  "+45": { min: 8, max: 8, typical: 8 }, // Denmark
  "+46": { min: 9, max: 9, typical: 9 }, // Sweden
  "+47": { min: 8, max: 8, typical: 8 }, // Norway
  "+48": { min: 9, max: 9, typical: 9 }, // Poland
  "+49": { min: 10, max: 11, typical: 10 }, // Germany
  "+51": { min: 9, max: 9, typical: 9 }, // Peru
  "+52": { min: 10, max: 10, typical: 10 }, // Mexico
  "+55": { min: 10, max: 11, typical: 11 }, // Brazil
  "+60": { min: 9, max: 10, typical: 10 }, // Malaysia
  "+61": { min: 9, max: 9, typical: 9 }, // Australia
  "+62": { min: 9, max: 11, typical: 10 }, // Indonesia
  "+63": { min: 10, max: 10, typical: 10 }, // Philippines
  "+64": { min: 8, max: 10, typical: 9 }, // New Zealand
  "+65": { min: 8, max: 8, typical: 8 }, // Singapore
  "+66": { min: 9, max: 9, typical: 9 }, // Thailand
  "+81": { min: 10, max: 10, typical: 10 }, // Japan
  "+82": { min: 9, max: 10, typical: 10 }, // South Korea
  "+84": { min: 9, max: 10, typical: 9 }, // Vietnam
  "+86": { min: 11, max: 11, typical: 11 }, // China
  "+90": { min: 10, max: 10, typical: 10 }, // Turkey
  "+91": { min: 10, max: 10, typical: 10 }, // India
  "+92": { min: 10, max: 10, typical: 10 }, // Pakistan
  "+94": { min: 9, max: 9, typical: 9 }, // Sri Lanka
  "+95": { min: 8, max: 10, typical: 9 }, // Myanmar
  "+98": { min: 10, max: 10, typical: 10 }, // Iran
  "+212": { min: 9, max: 9, typical: 9 }, // Morocco
  "+213": { min: 9, max: 9, typical: 9 }, // Algeria
  "+216": { min: 8, max: 8, typical: 8 }, // Tunisia
  "+218": { min: 9, max: 10, typical: 10 }, // Libya
  "+220": { min: 7, max: 7, typical: 7 }, // Gambia
  "+234": { min: 10, max: 10, typical: 10 }, // Nigeria
  "+249": { min: 9, max: 9, typical: 9 }, // Sudan
  "+251": { min: 9, max: 9, typical: 9 }, // Ethiopia
  "+254": { min: 9, max: 10, typical: 10 }, // Kenya
  "+255": { min: 9, max: 9, typical: 9 }, // Tanzania
  "+256": { min: 9, max: 9, typical: 9 }, // Uganda
  "+880": { min: 10, max: 10, typical: 10 }, // Bangladesh
  "+960": { min: 7, max: 7, typical: 7 }, // Maldives
  "+961": { min: 7, max: 8, typical: 8 }, // Lebanon
  "+962": { min: 9, max: 9, typical: 9 }, // Jordan
  "+963": { min: 9, max: 9, typical: 9 }, // Syria
  "+964": { min: 10, max: 10, typical: 10 }, // Iraq
  "+965": { min: 8, max: 8, typical: 8 }, // Kuwait
  "+966": { min: 9, max: 9, typical: 9 }, // Saudi Arabia
  "+967": { min: 9, max: 9, typical: 9 }, // Yemen
  "+968": { min: 8, max: 8, typical: 8 }, // Oman
  "+970": { min: 9, max: 9, typical: 9 }, // Palestine
  "+971": { min: 9, max: 9, typical: 9 }, // UAE
  "+972": { min: 9, max: 9, typical: 9 }, // Israel
  "+973": { min: 8, max: 8, typical: 8 }, // Bahrain
  "+974": { min: 8, max: 8, typical: 8 }, // Qatar
};

export const phoneCodeOptions = [
  { value: "+20", label: "🇪🇬 Egypt (+20)" },
  { value: "+966", label: "🇸🇦 Saudi Arabia (+966)" },
  { value: "+971", label: "🇦🇪 United Arab Emirates (+971)" },
  { value: "+974", label: "🇶🇦 Qatar (+974)" },
  { value: "+965", label: "🇰🇼 Kuwait (+965)" },
  { value: "+968", label: "🇴🇲 Oman (+968)" },
  { value: "+1", label: "🇺🇸 United States / Canada (+1)" },
  { value: "+44", label: "🇬🇧 United Kingdom (+44)" },
  { value: "+49", label: "🇩🇪 Germany (+49)" },
  { value: "+33", label: "🇫🇷 France (+33)" },
  { value: "+39", label: "🇮🇹 Italy (+39)" },
  { value: "+34", label: "🇪🇸 Spain (+34)" },
  { value: "+31", label: "🇳🇱 Netherlands (+31)" },
  { value: "+46", label: "🇸🇪 Sweden (+46)" },
  { value: "+47", label: "🇳🇴 Norway (+47)" },
  { value: "+48", label: "🇵🇱 Poland (+48)" },
  { value: "+45", label: "🇩🇰 Denmark (+45)" },
  { value: "+32", label: "🇧🇪 Belgium (+32)" },
  { value: "+41", label: "🇨🇭 Switzerland (+41)" },
  { value: "+351", label: "🇵🇹 Portugal (+351)" },
  { value: "+30", label: "🇬🇷 Greece (+30)" },
  { value: "+352", label: "🇱🇺 Luxembourg (+352)" },
  { value: "+353", label: "🇮🇪 Ireland (+353)" },
  { value: "+43", label: "🇦🇹 Austria (+43)" },
  { value: "+7", label: "🇷🇺 Russia (+7)" },
  { value: "+52", label: "🇲🇽 Mexico (+52)" },
  { value: "+55", label: "🇧🇷 Brazil (+55)" },
  { value: "+61", label: "🇦🇺 Australia (+61)" },
  { value: "+64", label: "🇳🇿 New Zealand (+64)" },
  { value: "+60", label: "🇲🇾 Malaysia (+60)" },
  { value: "+65", label: "🇸🇬 Singapore (+65)" },
  { value: "+62", label: "🇮🇩 Indonesia (+62)" },
  { value: "+63", label: "🇵🇭 Philippines (+63)" },
  { value: "+66", label: "🇹🇭 Thailand (+66)" },
  { value: "+81", label: "🇯🇵 Japan (+81)" },
  { value: "+82", label: "🇰🇷 South Korea (+82)" },
  { value: "+84", label: "🇻🇳 Vietnam (+84)" },
  { value: "+86", label: "🇨🇳 China (+86)" },
  { value: "+90", label: "🇹🇷 Turkey (+90)" },
  { value: "+91", label: "🇮🇳 India (+91)" },
  { value: "+92", label: "🇵🇰 Pakistan (+92)" },
  { value: "+212", label: "🇲🇦 Morocco (+212)" },
  { value: "+213", label: "🇩🇿 Algeria (+213)" },
  { value: "+216", label: "🇹🇳 Tunisia (+216)" },
  { value: "+218", label: "🇱🇾 Libya (+218)" },
  { value: "+249", label: "🇸🇩 Sudan (+249)" },
  { value: "+251", label: "🇪🇹 Ethiopia (+251)" },
  { value: "+254", label: "🇰🇪 Kenya (+254)" },
  { value: "+255", label: "🇹🇿 Tanzania (+255)" },
  { value: "+256", label: "🇺🇬 Uganda (+256)" },
  { value: "+234", label: "🇳🇬 Nigeria (+234)" },
  { value: "+27", label: "🇿🇦 South Africa (+27)" },
  { value: "+220", label: "🇬🇲 Gambia (+220)" },
  { value: "+880", label: "🇧🇩 Bangladesh (+880)" },
  { value: "+960", label: "🇲🇻 Maldives (+960)" },
  { value: "+961", label: "🇱🇧 Lebanon (+961)" },
  { value: "+962", label: "🇯🇴 Jordan (+962)" },
  { value: "+963", label: "🇸🇾 Syria (+963)" },
  { value: "+964", label: "🇮🇶 Iraq (+964)" },
  { value: "+967", label: "🇾🇪 Yemen (+967)" },
  { value: "+970", label: "🇵🇸 Palestine (+970)" },
  { value: "+972", label: "🇮🇱 Israel (+972)" },
  { value: "+973", label: "🇧🇭 Bahrain (+973)" },
];

export function getPhoneNumberInfo(countryCode: string) {
  const info = phoneNumberLengths[countryCode];
  if (info) {
    const lengthText = info.min === info.max 
      ? `${info.typical} digits`
      : `${info.min}-${info.max} digits`;
    return {
      placeholder: "1".repeat(info.typical),
      lengthText,
      ...info,
    };
  }
  return {
    placeholder: "1234567890",
    lengthText: "6-15 digits",
    min: 6,
    max: 15,
    typical: 10,
  };
}
