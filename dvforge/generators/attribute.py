from __future__ import annotations

from dvforge.model import Column, Entity
from dvforge.utils import prefixed

_MODIFIABLE = {
    'IsCustomizable': 1,
    'IsRenameable': 1,
    'CanModifySearchSettings': 1,
    'CanModifyRequirementLevelSettings': 1,
    'CanModifyAdditionalSettings': 1,
    'SourceType': 0,
    'IsGlobalFilterEnabled': 0,
    'IsSortableEnabled': 0,
    'CanModifyGlobalFilterSettings': 1,
    'CanModifyIsSortableSettings': 1,
    'IsDataSourceSecret': 0,
}


def _displayname(description: str) -> dict:
    return {'displayname': {'@description': description, '@languagecode': 1033}}


def _description(text: str) -> dict:
    return {'Description': {'@description': text, '@languagecode': 1033}}


def _attr(data: dict) -> dict:
    return {'attribute': data}


def _base(physical: str, attr_type: str, name: str, required: str,
          update: int, read: int, create: int,
          is_custom: int, audit: int, version: str | float,
          display_mask: str = '',
          ime: str = 'auto') -> dict:
    """Build the fixed-order preamble shared by all attribute types."""
    d: dict = {
        '@PhysicalName': physical,
        'Type': attr_type,
        'Name': name,
        'LogicalName': name,
        'RequiredLevel': required,
    }
    if display_mask:
        d['DisplayMask'] = display_mask
    d['ImeMode'] = ime
    d['ValidForUpdateApi'] = update
    d['ValidForReadApi'] = read
    d['ValidForCreateApi'] = create
    d['IsCustomField'] = is_custom
    d['IsAuditEnabled'] = audit
    d['IsSecured'] = 0
    d['IntroducedVersion'] = version
    d.update(_MODIFIABLE)
    return d


# ── Custom attribute generators ───────────────────────────────────────────────

def _primary_key(entity_name: str, prefix: str) -> tuple[str, dict]:
    full_entity = prefixed(entity_name, prefix)
    field_name = f"{full_entity}id"
    physical = f"{full_entity}Id"
    d = _base(physical, 'primarykey', field_name, 'systemrequired',
              update=0, read=1, create=1,
              is_custom=0, audit=0, version=1.0,
              display_mask='ValidForAdvancedFind|RequiredForGrid')
    d['CanModifyRequirementLevelSettings'] = 0
    d['IsSearchable'] = 0
    d['IsFilterable'] = 1
    d['IsRetrievable'] = 1
    d['IsLocalizable'] = 0
    d['displaynames'] = _displayname(entity_name)
    d['Descriptions'] = _description('Unique identifier for entity instances')
    return field_name, _attr(d)


def _custom_string(col: Column, prefix: str) -> tuple[str, dict]:
    full_name = prefixed(col.name, prefix)
    is_name_field = col.primary_name
    req_level = 'required' if col.required else 'none'

    mask = 'PrimaryName|ValidForAdvancedFind|ValidForForm|ValidForGrid' if is_name_field \
        else 'ValidForAdvancedFind|ValidForForm|ValidForGrid'
    if col.required:
        mask += '|RequiredForForm'

    max_len = col.max_length or 100
    d = _base(full_name, 'nvarchar', full_name, req_level,
              update=1, read=1, create=1,
              is_custom=1, audit=1, version=1.0,
              display_mask=mask)
    d['AutoNumberFormat'] = ''
    d['IsSearchable'] = 1 if is_name_field else 0
    d['IsFilterable'] = 0
    d['IsRetrievable'] = 1
    d['IsLocalizable'] = 0
    d['Format'] = 'text'
    d['MaxLength'] = max_len
    d['Length'] = max_len * 2
    d['displaynames'] = _displayname(col.display_name)
    d['Descriptions'] = _description('')
    return full_name, _attr(d)


def _custom_lookup(col: Column, prefix: str) -> tuple[str, dict]:
    full_name = prefixed(col.name, prefix)
    req_level = 'required' if col.required else 'recommended'
    d = _base(full_name, 'lookup', full_name, req_level,
              update=1, read=1, create=1,
              is_custom=1, audit=0, version='1.0.0.0',
              display_mask='ValidForAdvancedFind|ValidForForm|ValidForGrid',
              ime='')
    del d['ImeMode']  # custom lookups have no ImeMode in the output
    d['IsSearchable'] = 0
    d['IsFilterable'] = 0
    d['IsRetrievable'] = 0
    d['IsLocalizable'] = 0
    d['LookupStyle'] = 'single'
    d['LookupTypes'] = None
    d['displaynames'] = _displayname(col.display_name)
    d['Descriptions'] = _description('')
    return full_name, _attr(d)


def _custom_choice(col: Column, prefix: str) -> tuple[str, dict]:
    full_name = prefixed(col.name, prefix)
    option_set_name = prefixed(col.option_set, prefix) if col.option_set else ''
    req_level = 'required' if col.required else 'none'
    d = _base(full_name, 'picklist', full_name, req_level,
              update=1, read=1, create=1,
              is_custom=1, audit=1, version='1.0.0.0',
              display_mask='ValidForAdvancedFind|ValidForForm|ValidForGrid')
    d['IsSearchable'] = 0
    d['IsFilterable'] = 0
    d['IsRetrievable'] = 0
    d['IsLocalizable'] = 0
    d['AppDefaultValue'] = -1
    d['OptionSetName'] = option_set_name
    d['displaynames'] = _displayname(col.display_name)
    d['Descriptions'] = _description('')
    return full_name, _attr(d)


# ── System attribute definitions ──────────────────────────────────────────────

def _system_attributes(entity: Entity, prefix: str) -> list[tuple[str, dict]]:
    full_entity = prefixed(entity.name, prefix)

    def _slookup(physical: str, name: str, display: str, desc: str,
                 mask: str = 'ValidForAdvancedFind|ValidForForm|ValidForGrid',
                 audit: int = 0,
                 filterable: int = 0,
                 logical: bool = False,
                 create: int = 0) -> tuple[str, dict]:
        d = _base(physical, 'lookup', name, 'none',
                  update=0, read=1, create=create,
                  is_custom=0, audit=audit, version=1.0,
                  display_mask=mask)
        d['IsSearchable'] = 0
        d['IsFilterable'] = filterable
        d['IsRetrievable'] = 0
        d['IsLocalizable'] = 0
        if logical:
            d['IsLogical'] = 1
        d['LookupStyle'] = 'single'
        d['LookupTypes'] = None
        d['displaynames'] = _displayname(display)
        d['Descriptions'] = _description(desc)
        return name, _attr(d)

    def _sdatetime(physical: str, name: str, display: str, desc: str,
                   fmt: str = 'datetime',
                   filterable: int = 0,
                   retrievable: int = 0,
                   create: int = 0,
                   audit: int = 0,
                   mask: str = 'ValidForAdvancedFind|ValidForForm|ValidForGrid') -> tuple[str, dict]:
        d = _base(physical, 'datetime', name, 'none',
                  update=0, read=1, create=create,
                  is_custom=0, audit=audit, version=1.0,
                  display_mask=mask,
                  ime='inactive')
        d['IsSearchable'] = 0
        d['IsFilterable'] = filterable
        d['IsRetrievable'] = retrievable
        d['IsLocalizable'] = 0
        d['Format'] = fmt
        d['CanChangeDateTimeBehavior'] = 0
        d['Behavior'] = 1
        d['displaynames'] = _displayname(display)
        d['Descriptions'] = _description(desc)
        return name, _attr(d)

    def _sint(physical: str, name: str, display: str, desc: str,
              fmt: str = '',
              min_val: int = -1,
              max_val: int = 2147483647,
              create: int = 1,
              update: int = 1,
              audit: int = 0,
              mask: str = '',
              ime: str = 'auto') -> tuple[str, dict]:
        d = _base(physical, 'int', name, 'none',
                  update=update, read=1, create=create,
                  is_custom=0, audit=audit, version=1.0,
                  display_mask=mask, ime=ime)
        d['IsSearchable'] = 0
        d['IsFilterable'] = 0
        d['IsRetrievable'] = 0
        d['IsLocalizable'] = 0
        d['Format'] = fmt
        d['MinValue'] = min_val
        d['MaxValue'] = max_val
        d['displaynames'] = _displayname(display)
        d['Descriptions'] = _description(desc)
        return name, _attr(d)

    attrs: list[tuple[str, dict]] = [
        _slookup('CreatedBy', 'createdby', 'Created By',
                 'Unique identifier of the user who created the record.'),
        _sdatetime('CreatedOn', 'createdon', 'Created On',
                   'Date and time when the record was created.',
                   filterable=1, retrievable=1),
        _slookup('CreatedOnBehalfBy', 'createdonbehalfby', 'Created By (Delegate)',
                 'Unique identifier of the delegate user who created the record.'),
        _sint('ImportSequenceNumber', 'importsequencenumber',
              'Import Sequence Number',
              'Sequence number of the import that created this record.',
              fmt='', min_val=-2147483648, max_val=2147483647,
              update=0, audit=1,
              mask='ValidForAdvancedFind', ime='disabled'),
        _slookup('ModifiedBy', 'modifiedby', 'Modified By',
                 'Unique identifier of the user who modified the record.'),
        _sdatetime('ModifiedOn', 'modifiedon', 'Modified On',
                   'Date and time when the record was modified.',
                   filterable=1, retrievable=1),
        _slookup('ModifiedOnBehalfBy', 'modifiedonbehalfby', 'Modified By (Delegate)',
                 'Unique identifier of the delegate user who modified the record.'),
        _sdatetime('OverriddenCreatedOn', 'overriddencreatedon', 'Record Created On',
                   'Date and time that the record was migrated.',
                   fmt='date', create=1, audit=1,
                   mask='ValidForAdvancedFind|ValidForGrid'),
        (
            'ownerid',
            _attr({
                **_base('OwnerId', 'owner', 'ownerid', 'systemrequired',
                        update=1, read=1, create=1,
                        is_custom=0, audit=1, version=1.0,
                        display_mask='ValidForAdvancedFind|ValidForForm|ValidForGrid|RequiredForForm'),
                'IsSearchable': 0,
                'IsFilterable': 1,
                'IsRetrievable': 0,
                'IsLocalizable': 0,
                'LookupStyle': 'single',
                'LookupTypes': {
                    'LookupType': [
                        {'@id': '00000000-0000-0000-0000-000000000000', '#text': 8},
                        {'@id': '00000000-0000-0000-0000-000000000000', '#text': 9},
                    ]
                },
                'displaynames': _displayname('Owner'),
                'Descriptions': _description('Owner Id'),
            }),
        ),
        _slookup('OwningBusinessUnit', 'owningbusinessunit', 'Owning Business Unit',
                 'Unique identifier for the business unit that owns the record',
                 audit=1, filterable=1),
        _slookup('OwningTeam', 'owningteam', 'Owning Team',
                 'Unique identifier for the team that owns the record.',
                 mask='', logical=True),
        _slookup('OwningUser', 'owninguser', 'Owning User',
                 'Unique identifier for the user that owns the record.',
                 mask='', logical=True),
        (
            'statecode',
            _attr({
                **_base('statecode', 'state', 'statecode', 'systemrequired',
                        update=1, read=1, create=0,
                        is_custom=0, audit=1, version=1.0,
                        display_mask='ValidForAdvancedFind|ValidForForm|ValidForGrid'),
                'IsSearchable': 0,
                'IsFilterable': 1,
                'IsRetrievable': 0,
                'IsLocalizable': 0,
                'optionset': {
                    '@Name': f"{full_entity}_statecode",
                    'OptionSetType': 'state',
                    'IntroducedVersion': 1.0,
                    'IsCustomizable': 1,
                    'displaynames': _displayname('Status'),
                    'Descriptions': _description(f"Status of the {entity.name}"),
                    'states': {
                        'state': [
                            {'@value': 0, '@defaultstatus': 1, '@invariantname': 'Active',
                             'labels': {'label': {'@description': 'Active', '@languagecode': 1033}}},
                            {'@value': 1, '@defaultstatus': 2, '@invariantname': 'Inactive',
                             'labels': {'label': {'@description': 'Inactive', '@languagecode': 1033}}},
                        ]
                    },
                },
                'displaynames': _displayname('Status'),
                'Descriptions': _description(f"Status of the {entity.name}"),
            }),
        ),
        (
            'statuscode',
            _attr({
                **_base('statuscode', 'status', 'statuscode', 'none',
                        update=1, read=1, create=1,
                        is_custom=0, audit=1, version=1.0,
                        display_mask='ValidForAdvancedFind|ValidForForm|ValidForGrid'),
                'IsSearchable': 0,
                'IsFilterable': 0,
                'IsRetrievable': 0,
                'IsLocalizable': 0,
                'optionset': {
                    '@Name': f"{full_entity}_statuscode",
                    'OptionSetType': 'status',
                    'IntroducedVersion': 1.0,
                    'IsCustomizable': 1,
                    'displaynames': _displayname('Status Reason'),
                    'Descriptions': _description(f"Reason for the status of the {entity.name}"),
                    'statuses': {
                        'status': [
                            {'@value': 1, '@state': 0,
                             'labels': {'label': {'@description': 'Active', '@languagecode': 1033}}},
                            {'@value': 2, '@state': 1,
                             'labels': {'label': {'@description': 'Inactive', '@languagecode': 1033}}},
                        ]
                    },
                },
                'displaynames': _displayname('Status Reason'),
                'Descriptions': _description(f"Reason for the status of the {entity.name}"),
            }),
        ),
        _sint('TimeZoneRuleVersionNumber', 'timezoneruleversionnumber',
              'Time Zone Rule Version Number', 'For internal use only.'),
        _sint('UTCConversionTimeZoneCode', 'utcconversiontimezonecode',
              'UTC Conversion Time Zone Code',
              'Time zone code that was in use when the record was created.'),
    ]
    return attrs


# ── Public entry point ────────────────────────────────────────────────────────

def generate(entity: Entity, prefix: str) -> dict[str, dict]:
    full_entity = prefixed(entity.name, prefix)
    base = f"entities/{full_entity}/attributes"
    files: dict[str, dict] = {}

    pk_name, pk_data = _primary_key(entity.name, prefix)
    files[f"{base}/{pk_name}.yml"] = pk_data

    for col in entity.columns:
        if col.type == 'string':
            name, data = _custom_string(col, prefix)
        elif col.type == 'lookup':
            name, data = _custom_lookup(col, prefix)
        else:
            name, data = _custom_choice(col, prefix)
        files[f"{base}/{name}.yml"] = data

    for sys_name, sys_data in _system_attributes(entity, prefix):
        files[f"{base}/{sys_name}.yml"] = sys_data

    return files
