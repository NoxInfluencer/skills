# Error Codes

All errors returned by the NoxInfluencer API follow a consistent code system.

## Error Code Table

| Error Code | HTTP Status | Description | Typical Cause |
|------------|-------------|-------------|---------------|
| `INVALID_API_KEY` | 401 | API key is invalid or does not exist | Wrong key, deleted key, or missing auth header |
| `INSUFFICIENT_CREDIT` | 403 | Not enough credit quota | Current period balance exhausted |
| `INVALID_REQUEST` | 400 | Request parameters failed validation | Missing required fields, invalid values |
| `DUPLICATE_DATA` | 400 | Data already exists | Adding the same video to a monitoring project twice |
| `UPSTREAM_40017` | 403 | Upstream SaaS search quota exceeded | NoxInfluencer platform rate limit hit |
| `INTERNAL_ERROR` | 500 | Server-side error | Unexpected failure in the API gateway |

## Handling Guidelines

### INVALID_API_KEY
Route the user to `managing-account` to configure a valid key with `noxinfluencer auth --key <key>`.

### INSUFFICIENT_CREDIT
Inform the user that the operation cannot continue without more credits. Show remaining balance if available from a prior response.

### INVALID_REQUEST
Surface the specific validation error from the `summary` field. Help the user correct the parameter.

### DUPLICATE_DATA
Tell the user the resource already exists (e.g., "This video is already being monitored in that project").

### UPSTREAM_40017
Explain that the upstream platform quota has been reached. This is separate from the user's own credit quota. Retry may help after some time.

### INTERNAL_ERROR
Surface the error and suggest retrying. If it persists, the issue is on the server side.
