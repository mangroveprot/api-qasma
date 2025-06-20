import { plugin, Schema } from 'mongoose';
import softDeletePlugin from './soft-delete.plugin';

type PluginFunction = (schema: Schema, options?: any) => void;
type PluginWithOptions = [PluginFunction, object?];

const PluginManager = {
  basePlugins: new Map<string, PluginWithOptions>([
    ['softDelete', [softDeletePlugin as PluginFunction]],
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
