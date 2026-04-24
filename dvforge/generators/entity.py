from __future__ import annotations

from dvforge.model import Entity
from dvforge.utils import prefixed


def generate(entity: Entity, prefix: str) -> dict[str, dict]:
    full_name = prefixed(entity.name, prefix)
    ownership = 'UserOwned' if entity.ownership == 'user' else 'OrganizationOwned'

    data = {
        'Entity': {
            'Name': {
                '@LocalizedName': entity.display_name,
                '@OriginalName': entity.name,
                '#text': full_name,
            },
            'EntityInfo': {
                'entity': {
                    '@Name': full_name,
                    'LocalizedNames': {
                        'LocalizedName': {
                            '@description': entity.display_name,
                            '@languagecode': 1033,
                        }
                    },
                    'LocalizedCollectionNames': {
                        'LocalizedCollectionName': {
                            '@description': entity.display_name_plural,
                            '@languagecode': 1033,
                        }
                    },
                    'Descriptions': {
                        'Description': {
                            '@description': entity.description or '',
                            '@languagecode': 1033,
                        }
                    },
                    'EntitySetName': f"{full_name}s",
                    'IsDuplicateCheckSupported': 1,
                    'IsBusinessProcessEnabled': 0,
                    'IsRequiredOffline': 0,
                    'IsInteractionCentricEnabled': 0,
                    'IsCollaboration': 0,
                    'AutoRouteToOwnerQueue': 0,
                    'IsConnectionsEnabled': 0,
                    'EntityColor': '',
                    'IsDocumentManagementEnabled': 0,
                    'AutoCreateAccessTeams': 0,
                    'IsOneNoteIntegrationEnabled': 0,
                    'IsKnowledgeManagementEnabled': 0,
                    'IsSLAEnabled': 0,
                    'IsDocumentRecommendationsEnabled': 0,
                    'IsBPFEntity': 0,
                    'OwnershipTypeMask': ownership,
                    'IsAuditEnabled': 0,
                    'IsRetrieveAuditEnabled': 0,
                    'IsRetrieveMultipleAuditEnabled': 0,
                    'IsActivity': 0,
                    'ActivityTypeMask': '',
                    'IsActivityParty': 0,
                    'IsReplicated': 0,
                    'IsReplicationUserFiltered': 0,
                    'IsMailMergeEnabled': 1,
                    'IsVisibleInMobile': 0,
                    'IsVisibleInMobileClient': 0,
                    'IsReadOnlyInMobileClient': 0,
                    'IsOfflineInMobileClient': 0,
                    'DaysSinceRecordLastModified': 0,
                    'MobileOfflineFilters': '',
                    'IsMapiGridEnabled': 1,
                    'IsReadingPaneEnabled': 1,
                    'IsQuickCreateEnabled': 0,
                    'SyncToExternalSearchIndex': 0,
                    'IntroducedVersion': 1.0,
                    'IsCustomizable': 1,
                    'IsRenameable': 1,
                    'IsMappable': 1,
                    'CanModifyAuditSettings': 1,
                    'CanModifyMobileVisibility': 1,
                    'CanModifyMobileClientVisibility': 1,
                    'CanModifyMobileClientReadOnly': 1,
                    'CanModifyMobileClientOffline': 1,
                    'CanModifyConnectionSettings': 1,
                    'CanModifyDuplicateDetectionSettings': 1,
                    'CanModifyMailMergeSettings': 1,
                    'CanModifyQueueSettings': 1,
                    'CanCreateAttributes': 1,
                    'CanCreateForms': 1,
                    'CanCreateCharts': 1,
                    'CanCreateViews': 1,
                    'CanModifyAdditionalSettings': 1,
                    'CanEnableSyncToExternalSearchIndex': 1,
                    'IconVectorName': '',
                    'EnforceStateTransitions': 0,
                    'CanChangeHierarchicalRelationship': 1,
                    'EntityHelpUrlEnabled': 0,
                    'EntityHelpUrl': '',
                    'ChangeTrackingEnabled': 0,
                    'CanChangeTrackingBeEnabled': 1,
                    'IsEnabledForExternalChannels': 0,
                    'IsMSTeamsIntegrationEnabled': 0,
                    'IsSolutionAware': 0,
                }
            }
        }
    }
    return {f"entities/{full_name}/entity.yml": data}
