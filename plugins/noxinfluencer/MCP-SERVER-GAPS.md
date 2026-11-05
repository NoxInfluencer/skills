# MCP presentation integration follow-up

The plugin now applies MCP-only execution and Handoff-first presentation only when invoked through an installed Agent plugin. Shared standalone Skills and CLI behavior are unchanged. This is a plugin policy update, not evidence of new server capabilities or a successful browser integration.

## Observed service evidence

On 2026-11-03 the connected provider exposed 269 tools. No visible tool declaration advertised a Handoff producer or `handoff_url`. An authorized `campaign2_plan_list` read succeeded; it returned business items and pagination, `data.metadata: null`, and no top-level `_meta` or Handoff field. This observation does not enumerate private server configuration or prove that every other business response lacks optional presentation metadata.

The local browser-Handoff snapshot describes a deferred historical marketing-plan page producer. Do not restore its old name as a requirement or mark the snapshot supported without a reviewed current contract. The checked tool snapshot also needs reconciliation with the larger live catalog.

## Server work to verify and supply

1. Publish per-function presentation availability through a documented MCP contract: configured, unconfigured, or unavailable/failed. A missing field is currently unknown/not advertised; it must not be confused with a definitive unconfigured state. Publish the function-to-view mapping and supported object/filter/page/result parameters without exposing arbitrary redirect or identity inputs.
2. For configured views, return a short-lived server-issued `handoff_url` in a documented response location, or publish a current producer that the business contract identifies. Either approach works; a separate tool for each page is not required. Document expiry, single-use behavior, target/context binding and structured failures. These are requirements to agree, not existing field names beyond the observed Handoff design.
3. Cover each function's actual result view, including search, detail, report and confirmed mutation results. Preserve business object IDs, filters and result context. Identify which functions have no page so conversation fallback is deterministic. Do not treat an unrelated home page as result presentation.
4. Verify web-side issuance, consumption and Companion-session page/API permissions for each target. Check account and object authorization, expiry and required user interaction. OAuth success alone does not establish a browser session. The MCP server may delegate issuance to the web service.
5. Support obtaining a fresh presentation action after expiry/failure without repeating writes, job creation or business charges. Keep business completion separate from presentation completion.
6. Export reviewed live schemas and presentation contracts to update repository snapshots and mappings, then run actual end-to-end acceptance for configured, unconfigured, failed and expired presentation paths.

## Host work, not an MCP-server promise

Refreshing the active Agent task's MCP connection/tool catalog after OAuth and opening a right-side embedded browser require supported host capabilities. The plugin now records the original request, distinguishes successful authorization from connection readiness, resumes when possible, and explains a host continuation limitation when a reconnect/new task is required. A server-only change cannot guarantee hot refresh or a right panel in every Agent host.
