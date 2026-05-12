import type { Publisher } from "../model.js";

const _NIL_BEFORE = [
  "City", "County", "Country", "Fax", "FreightTermsCode", "ImportSequenceNumber",
  "Latitude", "Line1", "Line2", "Line3", "Longitude", "Name", "PostalCode",
  "PostOfficeBox", "PrimaryContactName",
];
const _NIL_AFTER = [
  "StateOrProvince", "Telephone1", "Telephone2", "Telephone3",
  "TimeZoneRuleVersionNumber", "UPSZone", "UTCOffset", "UTCConversionTimeZoneCode",
];

function nil(): Record<string, unknown> {
  return { "@xsi:nil": true, "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance" };
}

function address(number: number): Record<string, unknown> {
  const before: Record<string, unknown> = {};
  for (const f of _NIL_BEFORE) before[f] = nil();

  const after: Record<string, unknown> = {};
  for (const f of _NIL_AFTER) after[f] = nil();

  return {
    AddressNumber: number,
    AddressTypeCode: 1,
    ...before,
    ShippingMethodCode: 1,
    ...after,
  };
}

export function generate(publisher: Publisher): Record<string, unknown> {
  const data = {
    Publisher: {
      UniqueName: publisher.name,
      LocalizedNames: {
        LocalizedName: {
          "@description": publisher.display_name,
          "@languagecode": 1033,
        },
      },
      Descriptions: null,
      EMailAddress: nil(),
      SupportingWebsiteUrl: nil(),
      CustomizationPrefix: publisher.prefix,
      CustomizationOptionValuePrefix: publisher.option_value_prefix,
      Addresses: {
        Address: [address(1), address(2)],
      },
    },
  };
  return { [`publishers/${publisher.name}/publisher.yml`]: data };
}
