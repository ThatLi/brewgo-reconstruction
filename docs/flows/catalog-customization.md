# Catalog and product customization

This map captures static data capabilities and bounded UI structure. It deliberately excludes product names, descriptions, imagery, catalog payloads, and promotional copy.

## Catalog hierarchy

The following structure is observed or directly derived:

```text
Catalog content
└── first-level menu list
    └── category
        ├── optional nested third-level menu list
        └── product presentation rows
            ├── header / banner / grouped section
            ├── regular product
            ├── package product
            └── hidden or folded presentation state
```

- Product content carries currency and rule-display fields (`E-017`).
- Category state carries a product count, a price range, a nested menu list, and an availability-like numeric field (`E-018`).
- Presentation rows distinguish products, packages, headers, grouped sections, banners, and hidden rows (`E-020`).
- Exact hierarchy depth, sorting, server experiments, and empty-category behavior remain unknown.

## Product identity and pricing

Observed product state (`E-019`) includes:

- a parent and current category relationship;
- separate product and variant identifiers;
- original and discounted floating-point price fields plus currency;
- a maximum-amount field;
- product type, tags, ordering index, and image references;
- sugar and nutrition metadata.

For BrewGo, product and variant identifiers will be original synthetic values. Prices will be converted into integer fen at the clean-room specification boundary; no target price or product content will be copied.

## Customization

- The product/variant identifier distinction is consistent with selectable configurations, but it does not reveal a complete modifier schema (`E-019`, classification: inferred, medium confidence).
- Sugar-level metadata is directly observed, but the evidence does not prove that it is a user-selectable option for every product (`E-021`).
- Persisted cart products retain a selected variant identifier and can contain nested package products (`E-022`).
- Focused class-name searches did not identify a target-owned modifier-group/option model (`U-003`).

Therefore, required choices, minimum/maximum selection counts, default selections, per-option price deltas, and incompatible combinations are **unknown target behavior**. BrewGo will define those rules independently in Step 4 and label them as independent design rather than observed parity.

## Availability and limits

- Category availability-like state and product/cart enabled state are observed (`E-018`, `E-022`).
- A product maximum-amount field is observed (`E-019`), but whether it applies per line, cart, store, or promotion is unknown.
- Shop availability remains a separate context from product availability (`E-013`).
- Server-side inventory, time windows, and validation outcomes are not established by static data models.

## BrewGo requirements carried forward

| Requirement | Basis | Classification |
| --- | --- | --- |
| Hierarchical category navigation | `E-017`, `E-018` | Observed capability |
| Product cards and product detail | `E-011`, `E-019`, `E-020` | Derived |
| Regular and package products | `E-020`, `E-022` | Observed capability |
| Original and discounted price presentation | `E-019` | Observed capability; synthetic values only |
| Availability and quantity-limit messaging | `E-018`, `E-019`, `E-022` | Derived; exact rules independent |
| Modifier groups with required/min/max rules | `U-003` | Independent BrewGo design |
| Sugar preference example | `E-021` | Independent interaction over observed metadata |

## Explicit unknowns

- Search and filter algorithms, ranking, and recommendation policy
- Modifier group names, option names, required/default semantics, and price deltas
- Meaning of numeric product/category state values
- Catalog cache invalidation and offline fallback
- Server-enforced inventory and quantity limits
- Experiment assignment and its effect on catalog presentation
