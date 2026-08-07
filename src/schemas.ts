/**
 * Per-route x402 schemas — GENERATED FROM `openapi.json`, do not edit by hand.
 *
 * The x402 challenge a paid route answers with has to tell an agent two things
 * it cannot guess: how to call the route, and what it gets back for its money.
 * Both live under `accepts[].outputSchema` in the x402 Bazaar shape:
 *
 *     outputSchema.input   how to invoke  (method + path/query params or JSON body fields)
 *     outputSchema.output  the JSON Schema of the 200/201 body
 *
 * Keys match the paywall route map in `server.ts` exactly, so a route is
 * declared once and its schema is spread in:
 *
 *     "POST /thing": { price: "$0.01", description: "…", ...ROUTE_SCHEMAS["POST /thing"] }
 *
 * Everything here is copied verbatim from this service's OpenAPI document, so
 * the runtime 402 and the published spec can never drift apart.
 */

/** How an agent invokes a paid route. */
export type X402Input = {
  type: "http";
  method: string;
  /** Path segments, e.g. `:id` in `/cases/:id`. */
  pathParams?: Record<string, unknown>;
  queryParams?: Record<string, unknown>;
  queryRequired?: string[];
  bodyType?: "json";
  /** JSON Schema properties of the request body. */
  bodyFields?: Record<string, unknown>;
  bodyRequired?: string[];
};

/** The `outputSchema` object published in every `accepts[]` entry. */
export type X402RouteSchema = {
  input: X402Input;
  /** JSON Schema of the success response body. */
  output: Record<string, unknown>;
};

export type RouteSchemaEntry = { outputSchema: X402RouteSchema };

export const ROUTE_SCHEMAS: Record<string, RouteSchemaEntry> = {
  "GET /search": {
    "outputSchema": {
      "input": {
        "type": "http",
        "method": "GET",
        "queryParams": {
          "q": {
            "type": "string",
            "description": "Search term, e.g. `sony wh-1000xm5`."
          },
          "limit": {
            "type": "integer",
            "default": 10,
            "description": "Maximum listings to return (1–50)."
          }
        },
        "queryRequired": [
          "q"
        ]
      },
      "output": {
        "type": "object",
        "properties": {
          "source": {
            "type": "string"
          },
          "query": {
            "type": "string"
          },
          "count": {
            "type": "integer"
          },
          "listings": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "itemId": {
                  "type": "string"
                },
                "title": {
                  "type": "string"
                },
                "price": {
                  "type": "object",
                  "properties": {
                    "value": {
                      "type": "integer"
                    },
                    "currency": {
                      "type": "string"
                    }
                  }
                },
                "condition": {
                  "type": "string"
                },
                "seller": {
                  "type": "object",
                  "properties": {
                    "username": {
                      "type": "string"
                    },
                    "feedbackPercentage": {
                      "type": "number"
                    },
                    "feedbackScore": {
                      "type": "integer"
                    }
                  }
                },
                "buyingOption": {
                  "type": "string"
                },
                "shipping": {
                  "type": "object",
                  "properties": {
                    "cost": {
                      "type": "number"
                    },
                    "currency": {
                      "type": "string"
                    },
                    "type": {
                      "type": "string"
                    }
                  }
                },
                "location": {
                  "type": "string"
                },
                "itemWebUrl": {
                  "type": "string"
                },
                "imageUrl": {
                  "type": [
                    "null",
                    "string"
                  ]
                }
              }
            }
          },
          "payment": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "rail": {
                "type": "string"
              },
              "network": {
                "type": "string"
              },
              "transaction": {
                "type": "string"
              },
              "payer": {
                "type": "string"
              },
              "amount": {
                "type": "string"
              },
              "asset": {
                "type": "string"
              },
              "resource": {
                "type": "string"
              }
            }
          }
        }
      }
    }
  },
  "GET /deal-check/**": {
    "outputSchema": {
      "input": {
        "type": "http",
        "method": "GET",
        "pathParams": {
          "itemId": {
            "type": "string",
            "description": "Marketplace item id, e.g. `v1|120002|0` (URL-encoding optional)."
          }
        }
      },
      "output": {
        "type": "object",
        "properties": {
          "source": {
            "type": "string"
          },
          "checkedAt": {
            "type": "string"
          },
          "item": {
            "type": "object",
            "properties": {
              "itemId": {
                "type": "string"
              },
              "title": {
                "type": "string"
              },
              "price": {
                "type": "object",
                "properties": {
                  "value": {
                    "type": "number"
                  },
                  "currency": {
                    "type": "string"
                  }
                }
              },
              "condition": {
                "type": "string"
              },
              "seller": {
                "type": "object",
                "properties": {
                  "username": {
                    "type": "string"
                  },
                  "feedbackPercentage": {
                    "type": "number"
                  },
                  "feedbackScore": {
                    "type": "integer"
                  }
                }
              },
              "buyingOption": {
                "type": "string"
              },
              "shipping": {
                "type": "object",
                "properties": {
                  "cost": {
                    "type": "integer"
                  },
                  "currency": {
                    "type": "string"
                  },
                  "type": {
                    "type": "string"
                  }
                }
              },
              "location": {
                "type": "string"
              },
              "itemWebUrl": {
                "type": "string"
              },
              "imageUrl": {
                "type": [
                  "null",
                  "string"
                ]
              }
            }
          },
          "totalCost": {
            "type": "number"
          },
          "comparables": {
            "type": "object",
            "properties": {
              "count": {
                "type": "integer"
              },
              "priceRange": {
                "type": "object",
                "properties": {
                  "min": {
                    "type": "number"
                  },
                  "max": {
                    "type": "integer"
                  }
                }
              },
              "median": {
                "type": "number"
              },
              "mean": {
                "type": "number"
              },
              "sample": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "itemId": {
                      "type": "string"
                    },
                    "title": {
                      "type": "string"
                    },
                    "totalCost": {
                      "type": "integer"
                    },
                    "condition": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          },
          "verdict": {
            "type": "string"
          },
          "deltaVsMedian": {
            "type": "number"
          },
          "percentVsMedian": {
            "type": "integer"
          },
          "reasoning": {
            "type": "string"
          },
          "payment": {
            "type": "object",
            "properties": {
              "success": {
                "type": "boolean"
              },
              "rail": {
                "type": "string"
              },
              "network": {
                "type": "string"
              },
              "transaction": {
                "type": "string"
              },
              "payer": {
                "type": "string"
              },
              "amount": {
                "type": "string"
              },
              "asset": {
                "type": "string"
              },
              "resource": {
                "type": "string"
              }
            }
          }
        }
      }
    }
  }
};
