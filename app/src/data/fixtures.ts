import { fen } from "@/domain/money";
import type {
  Category,
  CategoryId,
  Coupon,
  CouponId,
  ModifierGroup,
  ModifierGroupId,
  ModifierOption,
  ModifierOptionId,
  Product,
  ProductId,
  Store,
  StoreId,
} from "@/domain/types";

const id = <Value extends string>(value: string) => value as Value;

export const stores: readonly Store[] = [
  {
    id: id<StoreId>("store-harbor"),
    name: "Harbor Point",
    address: "18 Seabreeze Walk",
    distanceLabel: "1.2 km",
    openingHours: "07:00–21:00",
    supportedModes: ["pickup", "delivery"],
    availability: "available",
  },
  {
    id: id<StoreId>("store-orchard"),
    name: "Orchard Gate",
    address: "42 Garden Avenue",
    distanceLabel: "2.8 km",
    openingHours: "08:00–20:00",
    supportedModes: ["pickup"],
    availability: "available",
  },
  {
    id: id<StoreId>("store-riverside"),
    name: "Riverside Lab",
    address: "7 Current Lane",
    distanceLabel: "3.4 km",
    openingHours: "07:30–22:00",
    supportedModes: ["pickup", "delivery"],
    availability: "available",
  },
];

export const categories: readonly Category[] = [
  { id: id<CategoryId>("espresso"), name: "Espresso", sortOrder: 1 },
  { id: id<CategoryId>("cold-brew"), name: "Cold Brew", sortOrder: 2 },
  { id: id<CategoryId>("tea"), name: "Tea", sortOrder: 3 },
  { id: id<CategoryId>("bakery"), name: "Bakery", sortOrder: 4 },
];

const groupIds = {
  size: id<ModifierGroupId>("size"),
  temperature: id<ModifierGroupId>("temperature"),
  sweetness: id<ModifierGroupId>("sweetness"),
  milk: id<ModifierGroupId>("milk"),
  shots: id<ModifierGroupId>("shots"),
};
const option = (value: string) => id<ModifierOptionId>(value);

export const modifierGroups: readonly ModifierGroup[] = [
  {
    id: groupIds.size,
    name: "Size",
    optionIds: [option("size-regular"), option("size-grand")],
    minSelections: 1,
    maxSelections: 1,
  },
  {
    id: groupIds.temperature,
    name: "Temperature",
    optionIds: [option("temp-iced"), option("temp-warm"), option("temp-hot")],
    minSelections: 1,
    maxSelections: 1,
  },
  {
    id: groupIds.sweetness,
    name: "Sweetness",
    optionIds: [option("sweet-none"), option("sweet-light"), option("sweet-balanced")],
    minSelections: 1,
    maxSelections: 1,
  },
  {
    id: groupIds.milk,
    name: "Milk",
    optionIds: [option("milk-whole"), option("milk-oat"), option("milk-coconut")],
    minSelections: 1,
    maxSelections: 1,
  },
  {
    id: groupIds.shots,
    name: "Extra shots",
    optionIds: [option("shot-one"), option("shot-two")],
    minSelections: 0,
    maxSelections: 1,
  },
];

const makeOption = (
  idValue: string,
  groupId: ModifierGroupId,
  name: string,
  price: number,
): ModifierOption => ({
  id: option(idValue),
  groupId,
  name,
  priceDeltaFen: fen(price),
  availability: "available",
});
export const modifierOptions: readonly ModifierOption[] = [
  makeOption("size-regular", groupIds.size, "Regular", 0),
  makeOption("size-grand", groupIds.size, "Grand", 400),
  makeOption("temp-iced", groupIds.temperature, "Iced", 0),
  makeOption("temp-warm", groupIds.temperature, "Warm", 0),
  makeOption("temp-hot", groupIds.temperature, "Hot", 0),
  makeOption("sweet-none", groupIds.sweetness, "No added sugar", 0),
  makeOption("sweet-light", groupIds.sweetness, "Light", 0),
  makeOption("sweet-balanced", groupIds.sweetness, "Balanced", 0),
  makeOption("milk-whole", groupIds.milk, "Whole", 0),
  makeOption("milk-oat", groupIds.milk, "Oat", 300),
  makeOption("milk-coconut", groupIds.milk, "Coconut", 300),
  makeOption("shot-one", groupIds.shots, "One extra shot", 400),
  makeOption("shot-two", groupIds.shots, "Two extra shots", 800),
];

const product = (
  productId: string,
  categoryId: string,
  name: string,
  description: string,
  price: number,
  groups: readonly ModifierGroupId[],
  tags: readonly string[],
): Product => ({
  id: id<ProductId>(productId),
  categoryId: id<CategoryId>(categoryId),
  name,
  description,
  basePriceFen: fen(price),
  availability: "available",
  maxQuantity: 8,
  modifierGroupIds: groups,
  tags,
});
const drinkGroups = [
  groupIds.size,
  groupIds.temperature,
  groupIds.sweetness,
  groupIds.milk,
  groupIds.shots,
] as const;
export const products: readonly Product[] = [
  product(
    "drink-oat-latte",
    "espresso",
    "Velvet Oat Latte",
    "Silky espresso with toasted oat notes.",
    2800,
    drinkGroups,
    ["oat", "espresso"],
  ),
  product(
    "drink-cloud-cappuccino",
    "espresso",
    "Cloud Cappuccino",
    "Airy foam over a bright double espresso.",
    2400,
    drinkGroups,
    ["classic", "espresso"],
  ),
  product(
    "drink-citrus-coldbrew",
    "cold-brew",
    "Citrus Cold Brew",
    "Slow-steeped coffee lifted with orange peel.",
    2600,
    [groupIds.size, groupIds.sweetness],
    ["cold", "citrus"],
  ),
  product(
    "drink-cocoa-drift",
    "espresso",
    "Cocoa Drift",
    "Dark cocoa, espresso, and a soft milk finish.",
    2900,
    drinkGroups,
    ["chocolate", "espresso"],
  ),
  product(
    "drink-jasmine-sparkler",
    "tea",
    "Jasmine Sparkler",
    "Jasmine tea with a crisp sparkling finish.",
    2500,
    [groupIds.size, groupIds.sweetness],
    ["tea", "sparkling"],
  ),
  product(
    "drink-matcha-cloud",
    "tea",
    "Matcha Cloud",
    "Stone-ground matcha with a cloud of milk.",
    2700,
    [groupIds.size, groupIds.temperature, groupIds.sweetness, groupIds.milk],
    ["matcha", "tea"],
  ),
  product(
    "food-almond-croissant",
    "bakery",
    "Toasted Almond Croissant",
    "Buttery layers with a toasted almond center.",
    1800,
    [],
    ["bakery", "almond"],
  ),
  {
    ...product(
      "food-sesame-cookie",
      "bakery",
      "Black Sesame Cookie",
      "A crisp-edged cookie with nutty sesame.",
      1200,
      [],
      ["bakery", "sesame"],
    ),
    availability: "unavailable",
    unavailableReason: "This synthetic batch is sold out for the demo.",
  },
];

export const coupons: readonly Coupon[] = [
  {
    id: id<CouponId>("coupon-welcome"),
    code: "BREW5",
    name: "First Sip",
    description: "¥5 off orders of ¥30 or more.",
    expiresAt: "2035-12-31T23:59:59.000Z",
    minSubtotalFen: fen(3000),
    eligibleProductIds: [],
    discount: { type: "fixed", amountFen: fen(500) },
  },
  {
    id: id<CouponId>("coupon-tea"),
    code: "TEATIME",
    name: "Tea Time",
    description: "20% off original tea drinks, up to ¥8.",
    expiresAt: "2035-12-31T23:59:59.000Z",
    minSubtotalFen: fen(2000),
    eligibleProductIds: [
      id<ProductId>("drink-jasmine-sparkler"),
      id<ProductId>("drink-matcha-cloud"),
    ],
    discount: { type: "percentage", basisPoints: 2000, maxDiscountFen: fen(800) },
  },
  {
    id: id<CouponId>("coupon-expired"),
    code: "OLD10",
    name: "Past Pour",
    description: "An intentionally expired demo coupon.",
    expiresAt: "2020-01-01T00:00:00.000Z",
    minSubtotalFen: fen(0),
    eligibleProductIds: [],
    discount: { type: "fixed", amountFen: fen(1000) },
  },
];
