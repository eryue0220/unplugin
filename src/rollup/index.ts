import type { RollupPlugin, UnpluginContextMeta, UnpluginFactory, UnpluginInstance, UnpluginOptions } from '../types'
import { toArray } from '../utils/general'

export function getRollupPlugin<UserOptions = Record<string, never>, Nested extends boolean = boolean>(
  factory: UnpluginFactory<UserOptions, Nested>,
) {
  return ((userOptions?: UserOptions) => {
    const meta: UnpluginContextMeta = {
      framework: 'rollup',
    }
    const rawPlugins = toArray(factory(userOptions!, meta))
    const plugins = rawPlugins.map(plugin => toRollupPlugin(plugin))
    return plugins.length === 1 ? plugins[0] : plugins
  }) as UnpluginInstance<UserOptions, Nested>['rollup']
}

export function toRollupPlugin(plugin: UnpluginOptions, containRollupOptions = true): RollupPlugin {
  if (plugin.transform && plugin.transformInclude) {
    const _transform = plugin.transform
    plugin.transform = function (code, id) {
      if (plugin.transformInclude && !plugin.transformInclude(id))
        return null

      return _transform.call(this, code, id)
    }
  }

  if (plugin.load && plugin.loadInclude) {
    const _load = plugin.load
    plugin.load = function (id) {
      if (plugin.loadInclude && !plugin.loadInclude(id))
        return null

      return _load.call(this, id)
    }
  }

  if (plugin.rollup && containRollupOptions)
    Object.assign(plugin, plugin.rollup)

  return plugin as RollupPlugin
}
