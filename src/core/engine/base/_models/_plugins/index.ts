import { plugin, Schema } from 'mongoose';
import softDeletePlugin from './soft-delete.plugin';
import auditTrailPlugin from './auditTrail.plugin';
import versioningPlugin from './versioning.plugin';
import historyPlugin from './history.plugin';
import indexPlugin from './index.plugin';

type PluginFunction = (schema: Schema, options?: any) => void;
type PluginWithOptions = [PluginFunction, object?];

const PluginManager = {
  basePlugins: new Map<string, PluginWithOptions>([
    ['auditTrail', [auditTrailPlugin as PluginFunction]],
    ['versioning', [versioningPlugin as PluginFunction]],
    ['softDelete', [softDeletePlugin as PluginFunction]],
    // ['history', [historyPlugin as PluginFunction]],
    [
      'index',
      [
        indexPlugin as PluginFunction,
        { fields: { createdAt: 1, updatedAt: 1 } },
      ],
    ],
  ]),

  applyPlugins(
    schema: Schema,
    options: {
      exclude?: string[];
      include?: PluginWithOptions[];
      modelName?: string;
    } = {},
  ) {
    const { exclude = [], include = [], modelName } = options;

    //run all the plugin except if excludes
    this.basePlugins.forEach(([plugin, defaultOptions], name) => {
      if (!exclude.includes(name)) {
        const pluginOptions = {
          ...(defaultOptions || {}),
          ...(name === 'history' && modelName ? { modelName } : {}),
        };
        schema.plugin(plugin, pluginOptions);
      }
    });

    //
    include.forEach(([plugin, opts]) => {
      const pluginOptions = {
        ...(opts || {}),
        modelName,
      };
    });
  },
  // create a new custom plugins
  registerBasePlugin(name: string, plugin: PluginFunction, options?: object) {
    this.basePlugins.set(name, [plugin, options]);
  },
};

export default PluginManager;
