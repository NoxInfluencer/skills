# WorkBuddy CLI Installation And Authorization

WorkBuddy prepares the pinned NoxInfluencer CLI when the user connects this connector. Run `noxinfluencer` in the WorkBuddy CLI environment. On Windows, use `noxinfluencer.cmd` when the shell requires it.

Check the installed CLI with `noxinfluencer --version` and the current connection with `noxinfluencer auth status`. Check the required operation with `noxinfluencer schema <cmd>` before setting arguments. If the command or schema is unavailable, report the installation or version issue and ask the user to reconnect through WorkBuddy.

When authorization is required, direct the user to the WorkBuddy connector's Connect control. The user completes the device login shown by WorkBuddy. Resume business operations once `noxinfluencer auth status` reports authentication. Use the connector's Disconnect control for sign-out.

Use the CLI credentials maintained by this connection. Keep credentials out of chat, files, command arguments and logs. Opening a business page or calling a business command does not perform device authorization.
