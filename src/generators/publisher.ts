import type { Publisher } from "../model.js";

function nil(): Record<string, unknown> {
  return { "@xsi:nil": true, "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance" };
}

function address(number: number): Record<string, unknown> {
  return {
    AddressNumber: number,
    AddressTypeCode: 1,
    City: nil(),
    County: nil(),
    Country: nil(),
    Fax: nil(),
    FreightTermsCode: nil(),
    ImportSequenceNumber: nil(),
    Latitude: nil(),
    Line1: nil(),
    Line2: nil(),
    Line3: nil(),
    Longitude: nil(),
    Name: nil(),
    PostalCode: nil(),
    PostOfficeBox: nil(),
    PrimaryContactName: nil(),
    ShippingMethodCode: 1,
    StateOrProvince: nil(),
    Telephone1: nil(),
    Telephone2: nil(),
    Telephone3: nil(),
    TimeZoneRuleVersionNumber: nil(),
    UPSZone: nil(),
    UTCOffset: nil(),
    UTCConversionTimeZoneCode: nil(),
  };
}

export function generate(publisher: Publisher, langCode: number): Record<string, unknown> {
  const data = {
    Publisher: {
      UniqueName: publisher.name,
      LocalizedNames: {
        LocalizedName: {
          "@description": publisher.display_name,
          "@languagecode": langCode,
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
