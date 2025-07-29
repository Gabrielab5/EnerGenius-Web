// Common device types with typical power consumption
export const deviceOptions = [
  { name: 'Refrigerator', type: 'Large Appliance', powerConsumption: 150, translationKey: 'devices.types.refrigerator', categoryTranslationKey: 'devices.categories.largeAppliance' },
  { name: 'Freezer', type: 'Large Appliance', powerConsumption: 200, translationKey: 'devices.types.freezer', categoryTranslationKey: 'devices.categories.largeAppliance' },
  { name: 'Washing Machine', type: 'Large Appliance', powerConsumption: 500, translationKey: 'devices.types.washingMachine', categoryTranslationKey: 'devices.categories.largeAppliance' },
  { name: 'Dryer', type: 'Large Appliance', powerConsumption: 3000, translationKey: 'devices.types.dryer', categoryTranslationKey: 'devices.categories.largeAppliance' },
  { name: 'Dishwasher', type: 'Large Appliance', powerConsumption: 1200, translationKey: 'devices.types.dishwasher', categoryTranslationKey: 'devices.categories.largeAppliance' },
  { name: 'Air Conditioner', type: 'Climate Control', powerConsumption: 1500, translationKey: 'devices.types.airConditioner', categoryTranslationKey: 'devices.categories.climateControl' },
  { name: 'Electric Heater', type: 'Climate Control', powerConsumption: 1500, translationKey: 'devices.types.electricHeater', categoryTranslationKey: 'devices.categories.climateControl' },
  { name: 'Water Heater', type: 'Large Appliance', powerConsumption: 4000, translationKey: 'devices.types.waterHeater', categoryTranslationKey: 'devices.categories.largeAppliance' },
  { name: 'Television', type: 'Electronics', powerConsumption: 100, translationKey: 'devices.types.television', categoryTranslationKey: 'devices.categories.electronics' },
  { name: 'Computer', type: 'Electronics', powerConsumption: 200, translationKey: 'devices.types.computer', categoryTranslationKey: 'devices.categories.electronics' },
  { name: 'Microwave', type: 'Kitchen Appliance', powerConsumption: 1000, translationKey: 'devices.types.microwave', categoryTranslationKey: 'devices.categories.kitchenAppliance' },
  { name: 'Electric Oven', type: 'Kitchen Appliance', powerConsumption: 2000, translationKey: 'devices.types.electricOven', categoryTranslationKey: 'devices.categories.kitchenAppliance' },
  { name: 'Coffee Maker', type: 'Kitchen Appliance', powerConsumption: 800, translationKey: 'devices.types.coffeeMaker', categoryTranslationKey: 'devices.categories.kitchenAppliance' },
  { name: 'Lighting (LED)', type: 'Lighting', powerConsumption: 10, translationKey: 'devices.types.lightingLED', categoryTranslationKey: 'devices.categories.lighting' },
  { name: 'Lighting (CFL)', type: 'Lighting', powerConsumption: 15, translationKey: 'devices.types.lightingCFL', categoryTranslationKey: 'devices.categories.lighting' },
  { name: 'Lighting (Incandescent)', type: 'Lighting', powerConsumption: 60, translationKey: 'devices.types.lightingIncandescent', categoryTranslationKey: 'devices.categories.lighting' },
];

// Device usage ranges for help tooltips
export const deviceRanges = {
  'Refrigerator': { powerRange: '100-250W', kwhRange: '1-3 kWh/day' },
  'Freezer': { powerRange: '150-300W', kwhRange: '1.5-4 kWh/day' },
  'Washing Machine': { powerRange: '400-800W', kwhRange: '1-3 kWh/cycle' },
  'Dryer': { powerRange: '2000-4000W', kwhRange: '3-5 kWh/cycle' },
  'Dishwasher': { powerRange: '1000-1500W', kwhRange: '1.5-2.5 kWh/cycle' },
  'Air Conditioner': { powerRange: '1000-3000W', kwhRange: '6-12 kWh/day' },
  'Electric Heater': { powerRange: '1000-2000W', kwhRange: '4-8 kWh/day' },
  'Water Heater': { powerRange: '3000-5000W', kwhRange: '8-15 kWh/day' },
  'Television': { powerRange: '80-200W', kwhRange: '0.5-1.5 kWh/day' },
  'Computer': { powerRange: '150-400W', kwhRange: '1-3 kWh/day' },
  'Microwave': { powerRange: '800-1200W', kwhRange: '0.5-1 kWh/day' },
  'Electric Oven': { powerRange: '1500-3000W', kwhRange: '2-4 kWh/use' },
  'Coffee Maker': { powerRange: '600-1000W', kwhRange: '0.3-0.8 kWh/day' },
  'Lighting (LED)': { powerRange: '5-15W', kwhRange: '0.1-0.3 kWh/day' },
  'Lighting (CFL)': { powerRange: '10-25W', kwhRange: '0.2-0.5 kWh/day' },
  'Lighting (Incandescent)': { powerRange: '40-100W', kwhRange: '0.5-1.2 kWh/day' },
};

// Age options for device dropdown
export const ageOptions = [
  { label: '1 year', value: '1', translationKey: 'devices.age.1year' },
  { label: '2 years', value: '2', translationKey: 'devices.age.2years' },
  { label: '3 years', value: '3', translationKey: 'devices.age.3years' },
  { label: '4 years', value: '4', translationKey: 'devices.age.4years' },
  { label: '5 years', value: '5', translationKey: 'devices.age.5years' },
  { label: '6+ years', value: '6', translationKey: 'devices.age.6plus' },
];
