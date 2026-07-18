import type {
  DietPlanResponse,
  HistoryResponse,
  LabValue,
  LanguageCode,
  LocalizedText,
  ReportAnalysisResponse,
  ReportPanel
} from "./types";

type LocalizedLabValue = Omit<LabValue, "plain_label" | "plain_summary" | "plain_explanation"> & {
  plain_label: LocalizedText;
  plain_summary: LocalizedText;
  plain_explanation: LocalizedText;
};

type LocalizedMeal = {
  id: string;
  meal: DietPlanResponse["meals"][number]["meal"];
  linked_value_id: string;
  title: LocalizedText;
  description: LocalizedText;
  reason: LocalizedText;
};

const pick = (text: LocalizedText, lang: LanguageCode) => text[lang] || text.en;

const labValues: LocalizedLabValue[] = [
  {
    id: "ldl",
    test_name: "LDL Cholesterol",
    value: 142,
    unit: "mg/dL",
    ref_low: 0,
    ref_high: 100,
    flag: "watch",
    panel: "heart_fats",
    plain_label: {
      en: "Cholesterol",
      hi: "कोलेस्ट्रॉल",
      te: "కొలెస్ట్రాల్"
    },
    plain_summary: {
      en: "Your cholesterol is a bit high.",
      hi: "आपका कोलेस्ट्रॉल थोड़ा ज्यादा है।",
      te: "Your cholesterol is a bit high."
    },
    plain_explanation: {
      en: "This can make it harder for blood to move easily over time. Small food swaps and walking can help.",
      hi: "समय के साथ इससे खून का बहाव मुश्किल हो सकता है। खाने में छोटे बदलाव और चलना मदद कर सकते हैं।",
      te: "Small food swaps and walking can help."
    }
  },
  {
    id: "hba1c",
    test_name: "HbA1c",
    value: 6.1,
    unit: "%",
    ref_low: 4,
    ref_high: 5.6,
    flag: "watch",
    panel: "blood_sugar",
    plain_label: {
      en: "Average blood sugar",
      hi: "औसत ब्लड शुगर",
      te: "Average blood sugar"
    },
    plain_summary: {
      en: "Your average sugar is higher than ideal.",
      hi: "आपकी औसत शुगर आदर्श स्तर से ज्यादा है।",
      te: "Your average sugar is higher than ideal."
    },
    plain_explanation: {
      en: "Balanced meals with protein, fibre, and smaller rice or roti portions can steady sugar levels.",
      hi: "प्रोटीन, फाइबर और चावल या रोटी की थोड़ी कम मात्रा वाली थाली शुगर को स्थिर रख सकती है।",
      te: "Balanced meals can steady sugar levels."
    }
  },
  {
    id: "hb",
    test_name: "Hemoglobin",
    value: 11.1,
    unit: "g/dL",
    ref_low: 12,
    ref_high: 15.5,
    flag: "attention",
    panel: "blood_health",
    plain_label: {
      en: "Iron-related blood strength",
      hi: "आयरन से जुड़ी खून की ताकत",
      te: "Iron-related blood strength"
    },
    plain_summary: {
      en: "Your blood strength looks low.",
      hi: "आपके खून की ताकत कम दिख रही है।",
      te: "Your blood strength looks low."
    },
    plain_explanation: {
      en: "This may explain tiredness. Iron-rich foods with lemon can help your body use iron better.",
      hi: "इससे थकान हो सकती है। नींबू के साथ आयरन वाले भोजन से शरीर आयरन को बेहतर उपयोग कर सकता है।",
      te: "Iron-rich foods with lemon may help."
    }
  },
  {
    id: "creatinine",
    test_name: "Creatinine",
    value: 0.9,
    unit: "mg/dL",
    ref_low: 0.6,
    ref_high: 1.2,
    flag: "good",
    panel: "kidneys",
    plain_label: {
      en: "Kidney filter check",
      hi: "किडनी फिल्टर जांच",
      te: "Kidney filter check"
    },
    plain_summary: {
      en: "Your kidney filter check looks good.",
      hi: "आपकी किडनी फिल्टर जांच अच्छी दिख रही है।",
      te: "Your kidney filter check looks good."
    },
    plain_explanation: {
      en: "Keep drinking water through the day and avoid extra salt most days.",
      hi: "दिन भर पानी पीते रहें और ज्यादातर दिनों में ज्यादा नमक से बचें।",
      te: "Keep drinking water through the day."
    }
  },
  {
    id: "sgpt",
    test_name: "SGPT",
    value: 38,
    unit: "U/L",
    ref_low: 7,
    ref_high: 45,
    flag: "good",
    panel: "liver",
    plain_label: {
      en: "Liver strain check",
      hi: "लिवर पर दबाव की जांच",
      te: "Liver strain check"
    },
    plain_summary: {
      en: "Your liver check is in a good range.",
      hi: "आपकी लिवर जांच अच्छी सीमा में है।",
      te: "Your liver check is in a good range."
    },
    plain_explanation: {
      en: "Your current number does not suggest extra liver strain.",
      hi: "आपका मौजूदा नंबर लिवर पर ज्यादा दबाव नहीं दिखाता।",
      te: "Your current number looks steady."
    }
  },
  {
    id: "tsh",
    test_name: "TSH",
    value: 3.2,
    unit: "mIU/L",
    ref_low: 0.4,
    ref_high: 4,
    flag: "good",
    panel: "thyroid",
    plain_label: {
      en: "Thyroid",
      hi: "थायरॉइड",
      te: "థైరాయిడ్"
    },
    plain_summary: {
      en: "Your thyroid level looks steady.",
      hi: "आपका थायरॉइड स्तर स्थिर दिख रहा है।",
      te: "Your thyroid level looks steady."
    },
    plain_explanation: {
      en: "No major food change is suggested from this value alone.",
      hi: "सिर्फ इस वैल्यू से बड़े भोजन बदलाव की जरूरत नहीं दिखती।",
      te: "No major food change is suggested from this value alone."
    }
  }
];

const panels: ReportPanel[] = ["heart_fats", "blood_sugar", "blood_health", "kidneys", "liver", "thyroid"];

export function makeReportAnalysis(lang: LanguageCode): ReportAnalysisResponse {
  const values: LabValue[] = labValues.map((value) => ({
    ...value,
    plain_label: pick(value.plain_label, lang),
    plain_summary: pick(value.plain_summary, lang),
    plain_explanation: pick(value.plain_explanation, lang)
  }));

  return {
    report_id: "report-2026-07-17",
    patient_name: "Asha R.",
    report_date: "2026-07-14",
    summary: pick(
      {
        en: "Most values look steady. Cholesterol, average sugar, and blood strength need simple follow-up steps.",
        hi: "ज्यादातर वैल्यू स्थिर दिख रही हैं। कोलेस्ट्रॉल, औसत शुगर और खून की ताकत पर आसान कदमों की जरूरत है।",
        te: "Most values look steady. A few need simple follow-up steps."
      },
      lang
    ),
    analysis: {
      anomalies: ["Cholesterol is a bit high", "Average sugar is higher than ideal", "Blood strength looks low"],
      possible_causes: ["Diet pattern", "Low iron intake", "Recent lifestyle changes"],
      suggested_diet: ["Add more fibre-rich foods", "Pair iron-rich foods with vitamin C", "Keep refined carbohydrates modest"],
      suggested_lifestyle_changes: ["Walk after meals", "Keep sleep consistent"]
    },
    groups: panels.map((panel) => ({
      panel,
      values: values.filter((value) => value.panel === panel)
    }))
  };
}

const meals: LocalizedMeal[] = [
  {
    id: "breakfast-poha",
    meal: "breakfast",
    linked_value_id: "hba1c",
    title: { en: "Vegetable poha with peanuts", hi: "सब्जी पोहा और मूंगफली", te: "Vegetable poha with peanuts" },
    description: {
      en: "Add peas, carrots, curry leaves, and a small bowl of curd.",
      hi: "इसमें मटर, गाजर, करी पत्ता और एक छोटी कटोरी दही जोड़ें।",
      te: "Add peas, carrots, curry leaves, and curd."
    },
    reason: {
      en: "Protein and fibre help your sugar rise more slowly.",
      hi: "प्रोटीन और फाइबर आपकी शुगर को धीरे बढ़ने में मदद करते हैं।",
      te: "Protein and fibre help your sugar rise slowly."
    }
  },
  {
    id: "lunch-rajma",
    meal: "lunch",
    linked_value_id: "ldl",
    title: { en: "Rajma bowl with salad", hi: "सलाद के साथ राजमा बाउल", te: "Rajma bowl with salad" },
    description: {
      en: "Use one katori brown rice or two phulkas, plus cucumber, onion, and lemon.",
      hi: "एक कटोरी ब्राउन राइस या दो फुल्के लें, साथ में खीरा, प्याज और नींबू।",
      te: "Use brown rice or phulkas with salad and lemon."
    },
    reason: {
      en: "Beans and salad support better cholesterol levels.",
      hi: "बीन्स और सलाद बेहतर कोलेस्ट्रॉल स्तर में मदद करते हैं।",
      te: "Beans and salad support better cholesterol levels."
    }
  },
  {
    id: "snack-chana",
    meal: "snack",
    linked_value_id: "hb",
    title: { en: "Roasted chana with lemon", hi: "नींबू के साथ भुना चना", te: "Roasted chana with lemon" },
    description: {
      en: "Pair a handful of chana with guava or orange when available.",
      hi: "एक मुट्ठी चना अमरूद या संतरे के साथ लें, जब उपलब्ध हो।",
      te: "Pair chana with guava or orange when available."
    },
    reason: {
      en: "This helps your iron levels, and vitamin C helps your body use iron.",
      hi: "यह आपके आयरन स्तर में मदद करता है, और विटामिन C शरीर को आयरन उपयोग करने में मदद करता है।",
      te: "This helps your iron levels."
    }
  },
  {
    id: "dinner-fish",
    meal: "dinner",
    linked_value_id: "ldl",
    title: { en: "Grilled fish or paneer with dal", hi: "ग्रिल्ड मछली या पनीर, दाल के साथ", te: "Grilled fish or paneer with dal" },
    description: {
      en: "Keep the plate half vegetables, one quarter protein, and one quarter roti or millet.",
      hi: "थाली में आधी सब्जियां, एक चौथाई प्रोटीन और एक चौथाई रोटी या मिलेट रखें।",
      te: "Keep half the plate vegetables."
    },
    reason: {
      en: "This supports cholesterol while keeping dinner filling.",
      hi: "यह कोलेस्ट्रॉल में मदद करता है और रात का खाना पेट भर रखता है।",
      te: "This supports cholesterol while keeping dinner filling."
    }
  }
];

export function makeDietPlan(lang: LanguageCode): DietPlanResponse {
  return {
    report_id: "report-2026-07-17",
    headline: pick(
      {
        en: "A simple Indian plate plan for sugar, cholesterol, and iron.",
        hi: "शुगर, कोलेस्ट्रॉल और आयरन के लिए आसान भारतीय थाली योजना।",
        te: "A simple Indian plate plan for sugar, cholesterol, and iron."
      },
      lang
    ),
    meals: meals.map((meal) => ({
      id: meal.id,
      meal: meal.meal,
      linked_value_id: meal.linked_value_id,
      title: pick(meal.title, lang),
      description: pick(meal.description, lang),
      reason: pick(meal.reason, lang)
    }))
  };
}

export function makeHistory(lang: LanguageCode): HistoryResponse {
  return {
    reports: [
      {
        id: "report-2026-07-17",
        date: "2026-07-14",
        title: pick({ en: "July full body check", hi: "जुलाई फुल बॉडी जांच", te: "July full body check" }, lang),
        highlights: [
          pick({ en: "Sugar needs watching", hi: "शुगर पर ध्यान दें", te: "Sugar needs watching" }, lang),
          pick({ en: "Kidney check looks good", hi: "किडनी जांच अच्छी है", te: "Kidney check looks good" }, lang)
        ]
      },
      {
        id: "report-2026-04-12",
        date: "2026-04-12",
        title: pick({ en: "April follow-up", hi: "अप्रैल फॉलो-अप", te: "April follow-up" }, lang),
        highlights: [
          pick({ en: "Cholesterol improved", hi: "कोलेस्ट्रॉल बेहतर हुआ", te: "Cholesterol improved" }, lang)
        ]
      },
      {
        id: "report-2026-01-20",
        date: "2026-01-20",
        title: pick({ en: "January baseline", hi: "जनवरी शुरुआती जांच", te: "January baseline" }, lang),
        highlights: [
          pick({ en: "Iron was low", hi: "आयरन कम था", te: "Iron was low" }, lang)
        ]
      }
    ],
    trends: {
      hba1c: [
        { date: "2026-01-20", value: 6.5, ref_low: 4, ref_high: 5.6, unit: "%" },
        { date: "2026-04-12", value: 6.3, ref_low: 4, ref_high: 5.6, unit: "%" },
        { date: "2026-07-14", value: 6.1, ref_low: 4, ref_high: 5.6, unit: "%" }
      ],
      ldl: [
        { date: "2026-01-20", value: 162, ref_low: 0, ref_high: 100, unit: "mg/dL" },
        { date: "2026-04-12", value: 151, ref_low: 0, ref_high: 100, unit: "mg/dL" },
        { date: "2026-07-14", value: 142, ref_low: 0, ref_high: 100, unit: "mg/dL" }
      ]
    }
  };
}
