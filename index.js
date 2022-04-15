const path = require('path');
const fs = require('fs');

const options = {
    saveName: 'chunk_build_map.txt',
    output: '',
}

class ChunkBuildMapPlugin {
    constructor(opts) {
        this.options = Object.assign({},options,opts)
    }
    apply(compiler) {
        compiler.hooks.emit.tap('CustomPlugin', (compilation,cb)=>{
            let splitChunks = compilation.chunks.filter(isSplitChunk);
            // rename assets files
            let assets = compilation.assets;
            let filename, chunk;
            let content = [];
            for (filename in assets) {
                chunk = getChunkByFilename(splitChunks, filename);
                if (!chunk) continue
                content.push("asset: "+filename)
                // console.log(path.resolve(compiler.outputPath,filename))
                let modules = chunk.getModules();
                modules.forEach((module)=>{
                    let resource;
                    if (module.rootModule) {
                        resource = module.rootModule.resource
                    } else {
                        resource = module.resource
                    }
                    content.push(`  - ${resource} ${module.type}`)
                })
            }
            fs.writeFileSync(path.resolve(compiler.outputPath,this.options.output,this.options.saveName),content.join('\n'))
        })
    }
}

function isSplitChunk(chunk) {
    try {
        // only support in webpack v1
        return !chunk.name && !chunk.entry && !chunk.initial;
    } catch (err) {
        // compat with webpack 3+
        return !chunk.name && !chunk.hasEntryModule() && !chunk.canBeInitial();
    }
}

function getChunkByFilename(chunks, filename) {
    let match = chunks.filter(function(chunk) {
        return chunk.files.indexOf(filename) > -1;
    });
    return match.length > 0 ? match[0] : null;
}

module.exports = ChunkBuildMapPlugin;