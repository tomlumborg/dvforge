from __future__ import annotations

from dvforge.model import Publisher

_NIL_BEFORE = [
    'City', 'County', 'Country', 'Fax', 'FreightTermsCode', 'ImportSequenceNumber',
    'Latitude', 'Line1', 'Line2', 'Line3', 'Longitude', 'Name', 'PostalCode',
    'PostOfficeBox', 'PrimaryContactName',
]
_NIL_AFTER = [
    'StateOrProvince', 'Telephone1', 'Telephone2', 'Telephone3',
    'TimeZoneRuleVersionNumber', 'UPSZone', 'UTCOffset', 'UTCConversionTimeZoneCode',
]


def _nil() -> dict:
    return {'@xsi:nil': True, '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance'}


def _address(number: int) -> dict:
    return {
        'AddressNumber': number,
        'AddressTypeCode': 1,
        **{f: _nil() for f in _NIL_BEFORE},
        'ShippingMethodCode': 1,
        **{f: _nil() for f in _NIL_AFTER},
    }


def generate(publisher: Publisher) -> dict[str, dict]:
    data = {
        'Publisher': {
            'UniqueName': publisher.name,
            'LocalizedNames': {
                'LocalizedName': {
                    '@description': publisher.display_name,
                    '@languagecode': 1033,
                }
            },
            'Descriptions': None,
            'EMailAddress': _nil(),
            'SupportingWebsiteUrl': _nil(),
            'CustomizationPrefix': publisher.prefix,
            'CustomizationOptionValuePrefix': publisher.option_value_prefix,
            'Addresses': {
                'Address': [_address(1), _address(2)],
            },
        }
    }
    return {f"publishers/{publisher.name}/publisher.yml": data}
