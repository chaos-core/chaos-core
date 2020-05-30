ChaosCore Plugin API
====================

## Plugin

```JS
module.exports = {
  // === Plugin Configuration === //
  
  // The name of the plugin. Used to identify where a command comes from and 
  // namespaces services and config actions. Using a `camelCase` plugin name
  // is highly recommended 
  name: 'AwesomePlugin',
  
  // A description of the plugin. Used when listing plugins.
  description: 'This Plugin does awesome things.',
  
  // Define data that should be loaded automatically when the bot joins a new
  // guild. Useful for setting up expected data structures, or preloading some
  // default settings. You can only store strings, arrays, or basic objects
  // inside a dataSource.
  //
  // defaultData: [
  //  { keyword: "some.key.to.the.data", data: "Any primitive value" }
  // ]
  defaultData: [],
  
  // === Plugin Features === //
  
  // List of new permission roles that this plugin uses. Eg. 'mod', `chaosLord`
  // See the section on permissions to learn more.
  permissionLevels: [],
  
  // List of Services that this plugin provides. For example `ChaosService`.
  // See the section on Services to learn more.
  services: [],
  
  // List of actions that the bot admins can use use configure settings for this
  // plugin. Such as `enableChaos`, or `setChaosColour`. See the section on 
  // Config Actions below to learn more.
  configActions: [],
  
  // List of commands that the plugin allows. See the section on Commands to
  // learn more.
  commands: [],
  
  // A Express Router to mount on the webApi at "/{pluginName}"
  // `req.chaos` is added as a reference to currently running bot
  webRouter: null,
}

```
