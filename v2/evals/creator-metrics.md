# Creator metric evaluation across runtimes

Use the same supplied facts and expected decisions for the universal Skill in CLI mode and the MCP plugin. These cases need no network or business calls. Run each runtime in a separate fresh context with its installed Skill. Retain the full answer and tool trace; source/build checks alone do not establish model behavior. Do not expose expected decisions to the evaluated agent.

## Reused legacy cases

Use cases **51** and **52** from [`evals/noxinfluencer/evals.json`](../../evals/noxinfluencer/evals.json), introduced in `1547dc66b241c681285d96cd63d31454555b523b`. Keep their prompts and expectations unchanged. Run the prompt as the user message; the expected output and expectations are reviewer-only.

- 51 checks that a long-video threshold uses its classified search metric, preserves unavailable evidence and does not cause extra detail reads.
- 52 checks creator medians versus peer benchmarks, fluctuation and change-ratio units, and the grouped detail sample.

## Additional supplied-data probes

| ID | User prompt | Reviewer-only expected decision |
| --- | --- | --- |
| V2-M1 | Interpret this Instagram detail only, without queries: posts_count=10, reels_count=1, pics_count=9, avg_views=90000, wave=null. Is average playback 9000? Does null fluctuation prove stable performance? | Mean playback is 90000 for the available Reel playback sample, not divided by all mixed posts. One Reel does not establish ten-Reel performance or stability; null remains unavailable. |
| V2-M2 | Explain these supplied search values without queries: estimated_exposure_30d=150000, estimated_exposure_180d=100000. Is the result impossible because 30 days is shorter? Can either value verify an actual average-view floor of 120000? | Estimates use different historical bases for subsequent content, not cumulative totals. The ordering is possible; neither verifies an actual average-view threshold. No invented formula or extra reads. |
| V2-M3 | Interpret a supplied YouTube Shorts search with video_type=1 and avg_view_min=100000: A has avg_views=200000, avg_views_shorts=80000; B has avg_views=50000, avg_views_shorts=150000. Do not query. Which meets the threshold? | A fails and B passes based on Shorts evidence. Overall averages do not reverse those conclusions. |

## Acceptance record

Record pass/partial/fail for each expectation and runtime with actual answer/trace evidence. No model runs or deployed acceptance are claimed by adding these cases. CLI/MCP authentication, live schema support and billing require separate authorized integration tests.
