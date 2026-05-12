import type { Entity } from "../model.js";
import { prefixed, f } from "../utils.js";

export function generate(entity: Entity, prefix: string): Record<string, unknown> {
  const fullName = prefixed(entity.name, prefix);
  const ownership = entity.ownership === "user" ? "UserOwned" : "OrganizationOwned";

  const data = {
    Entity: {
      Name: {
        "@LocalizedName": entity.display_name,
        "@OriginalName": entity.display_name,
        "#text": fullName,
      },
      EntityInfo: {
        entity: {
          "@Name": fullName,
          LocalizedNames: {
            LocalizedName: {
              "@description": entity.display_name,
              "@languagecode": 1033,
            },
          },
          LocalizedCollectionNames: {
            LocalizedCollectionName: {
              "@description": entity.display_name_plural,
              "@languagecode": 1033,
            },
          },
          Descriptions: {
            Description: {
              "@description": entity.description ?? "",
              "@languagecode": 1033,
            },
          },
          EntitySetName: `${fullName}s`,
          IsDuplicateCheckSupported: 1,
          IsBusinessProcessEnabled: 0,
          IsRequiredOffline: 0,
          IsInteractionCentricEnabled: 0,
          IsCollaboration: 0,
          AutoRouteToOwnerQueue: 0,
          IsConnectionsEnabled: 0,
          EntityColor: "",
          IsDocumentManagementEnabled: 0,
          AutoCreateAccessTeams: 0,
          IsOneNoteIntegrationEnabled: 0,
          IsKnowledgeManagementEnabled: 0,
          IsSLAEnabled: 0,
          IsDocumentRecommendationsEnabled: 0,
          IsBPFEntity: 0,
          OwnershipTypeMask: ownership,
          IsAuditEnabled: 0,
          IsRetrieveAuditEnabled: 0,
          IsRetrieveMultipleAuditEnabled: 0,
          IsActivity: 0,
          ActivityTypeMask: "",
          IsActivityParty: 0,
          IsReplicated: 0,
          IsReplicationUserFiltered: 0,
          IsMailMergeEnabled: 1,
          IsVisibleInMobile: 0,
          IsVisibleInMobileClient: 0,
          IsReadOnlyInMobileClient: 0,
          IsOfflineInMobileClient: 0,
          DaysSinceRecordLastModified: 0,
          MobileOfflineFilters: "",
          IsMapiGridEnabled: 1,
          IsReadingPaneEnabled: 1,
          IsQuickCreateEnabled: 0,
          SyncToExternalSearchIndex: 0,
          IntroducedVersion: f(1.0),
          IsCustomizable: 1,
          IsRenameable: 1,
          IsMappable: 1,
          CanModifyAuditSettings: 1,
          CanModifyMobileVisibility: 1,
          CanModifyMobileClientVisibility: 1,
          CanModifyMobileClientReadOnly: 1,
          CanModifyMobileClientOffline: 1,
          CanModifyConnectionSettings: 1,
          CanModifyDuplicateDetectionSettings: 1,
          CanModifyMailMergeSettings: 1,
          CanModifyQueueSettings: 1,
          CanCreateAttributes: 1,
          CanCreateForms: 1,
          CanCreateCharts: 1,
          CanCreateViews: 1,
          CanModifyAdditionalSettings: 1,
          CanEnableSyncToExternalSearchIndex: 1,
          IconVectorName: "",
          EnforceStateTransitions: 0,
          CanChangeHierarchicalRelationship: 1,
          EntityHelpUrlEnabled: 0,
          EntityHelpUrl: "",
          ChangeTrackingEnabled: 0,
          CanChangeTrackingBeEnabled: 1,
          IsEnabledForExternalChannels: 0,
          IsMSTeamsIntegrationEnabled: 0,
          IsSolutionAware: 0,
        },
      },
    },
  };
  return { [`entities/${fullName}/entity.yml`]: data };
}
