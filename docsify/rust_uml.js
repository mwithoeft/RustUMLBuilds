"use strict";

if( typeof Rust === "undefined" ) {
    var Rust = {};
}

(function( root, factory ) {
    if( typeof define === "function" && define.amd ) {
        define( [], factory );
    } else if( typeof module === "object" && module.exports ) {
        module.exports = factory();
    } else {
        Rust.rust_uml = factory();
    }
}( this, function() {
    return (function( module_factory ) {
        var instance = module_factory();

        if( typeof window === "undefined" && typeof process === "object" ) {
            var fs = require( "fs" );
            var path = require( "path" );
            var wasm_path = path.join( __dirname, "rust_uml.wasm" );
            var buffer = fs.readFileSync( wasm_path );
            var mod = new WebAssembly.Module( buffer );
            var wasm_instance = new WebAssembly.Instance( mod, instance.imports );
            return instance.initialize( wasm_instance );
        } else {
            var file = fetch( "https://mwithoeft.github.io/RustUMLBuilds/docsify/rust_uml.wasm", {credentials: "same-origin"} );

            var wasm_instance = ( typeof WebAssembly.instantiateStreaming === "function"
                ? WebAssembly.instantiateStreaming( file, instance.imports )
                    .then( function( result ) { return result.instance; } )

                : file
                    .then( function( response ) { return response.arrayBuffer(); } )
                    .then( function( bytes ) { return WebAssembly.compile( bytes ); } )
                    .then( function( mod ) { return WebAssembly.instantiate( mod, instance.imports ) } ) );

            return wasm_instance
                .then( function( wasm_instance ) {
                    var exports = instance.initialize( wasm_instance );
                    console.log( "Finished loading Rust wasm module 'rust_uml'" );
                    return exports;
                })
                .catch( function( error ) {
                    console.log( "Error loading Rust wasm module 'rust_uml':", error );
                    throw error;
                });
        }
    }( function() {
    var Module = {};

    Module.STDWEB_PRIVATE = {};

// This is based on code from Emscripten's preamble.js.
Module.STDWEB_PRIVATE.to_utf8 = function to_utf8( str, addr ) {
    for( var i = 0; i < str.length; ++i ) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
        var u = str.charCodeAt( i ); // possibly a lead surrogate
        if( u >= 0xD800 && u <= 0xDFFF ) {
            u = 0x10000 + ((u & 0x3FF) << 10) | (str.charCodeAt( ++i ) & 0x3FF);
        }

        if( u <= 0x7F ) {
            HEAPU8[ addr++ ] = u;
        } else if( u <= 0x7FF ) {
            HEAPU8[ addr++ ] = 0xC0 | (u >> 6);
            HEAPU8[ addr++ ] = 0x80 | (u & 63);
        } else if( u <= 0xFFFF ) {
            HEAPU8[ addr++ ] = 0xE0 | (u >> 12);
            HEAPU8[ addr++ ] = 0x80 | ((u >> 6) & 63);
            HEAPU8[ addr++ ] = 0x80 | (u & 63);
        } else if( u <= 0x1FFFFF ) {
            HEAPU8[ addr++ ] = 0xF0 | (u >> 18);
            HEAPU8[ addr++ ] = 0x80 | ((u >> 12) & 63);
            HEAPU8[ addr++ ] = 0x80 | ((u >> 6) & 63);
            HEAPU8[ addr++ ] = 0x80 | (u & 63);
        } else if( u <= 0x3FFFFFF ) {
            HEAPU8[ addr++ ] = 0xF8 | (u >> 24);
            HEAPU8[ addr++ ] = 0x80 | ((u >> 18) & 63);
            HEAPU8[ addr++ ] = 0x80 | ((u >> 12) & 63);
            HEAPU8[ addr++ ] = 0x80 | ((u >> 6) & 63);
            HEAPU8[ addr++ ] = 0x80 | (u & 63);
        } else {
            HEAPU8[ addr++ ] = 0xFC | (u >> 30);
            HEAPU8[ addr++ ] = 0x80 | ((u >> 24) & 63);
            HEAPU8[ addr++ ] = 0x80 | ((u >> 18) & 63);
            HEAPU8[ addr++ ] = 0x80 | ((u >> 12) & 63);
            HEAPU8[ addr++ ] = 0x80 | ((u >> 6) & 63);
            HEAPU8[ addr++ ] = 0x80 | (u & 63);
        }
    }
};

Module.STDWEB_PRIVATE.noop = function() {};
Module.STDWEB_PRIVATE.to_js = function to_js( address ) {
    var kind = HEAPU8[ address + 12 ];
    if( kind === 0 ) {
        return undefined;
    } else if( kind === 1 ) {
        return null;
    } else if( kind === 2 ) {
        return HEAP32[ address / 4 ];
    } else if( kind === 3 ) {
        return HEAPF64[ address / 8 ];
    } else if( kind === 4 ) {
        var pointer = HEAPU32[ address / 4 ];
        var length = HEAPU32[ (address + 4) / 4 ];
        return Module.STDWEB_PRIVATE.to_js_string( pointer, length );
    } else if( kind === 5 ) {
        return false;
    } else if( kind === 6 ) {
        return true;
    } else if( kind === 7 ) {
        var pointer = Module.STDWEB_PRIVATE.arena + HEAPU32[ address / 4 ];
        var length = HEAPU32[ (address + 4) / 4 ];
        var output = [];
        for( var i = 0; i < length; ++i ) {
            output.push( Module.STDWEB_PRIVATE.to_js( pointer + i * 16 ) );
        }
        return output;
    } else if( kind === 8 ) {
        var arena = Module.STDWEB_PRIVATE.arena;
        var value_array_pointer = arena + HEAPU32[ address / 4 ];
        var length = HEAPU32[ (address + 4) / 4 ];
        var key_array_pointer = arena + HEAPU32[ (address + 8) / 4 ];
        var output = {};
        for( var i = 0; i < length; ++i ) {
            var key_pointer = HEAPU32[ (key_array_pointer + i * 8) / 4 ];
            var key_length = HEAPU32[ (key_array_pointer + 4 + i * 8) / 4 ];
            var key = Module.STDWEB_PRIVATE.to_js_string( key_pointer, key_length );
            var value = Module.STDWEB_PRIVATE.to_js( value_array_pointer + i * 16 );
            output[ key ] = value;
        }
        return output;
    } else if( kind === 9 ) {
        return Module.STDWEB_PRIVATE.acquire_js_reference( HEAP32[ address / 4 ] );
    } else if( kind === 10 || kind === 12 || kind === 13 ) {
        var adapter_pointer = HEAPU32[ address / 4 ];
        var pointer = HEAPU32[ (address + 4) / 4 ];
        var deallocator_pointer = HEAPU32[ (address + 8) / 4 ];
        var num_ongoing_calls = 0;
        var drop_queued = false;
        var output = function() {
            if( pointer === 0 || drop_queued === true ) {
                if (kind === 10) {
                    throw new ReferenceError( "Already dropped Rust function called!" );
                } else if (kind === 12) {
                    throw new ReferenceError( "Already dropped FnMut function called!" );
                } else {
                    throw new ReferenceError( "Already called or dropped FnOnce function called!" );
                }
            }

            var function_pointer = pointer;
            if (kind === 13) {
                output.drop = Module.STDWEB_PRIVATE.noop;
                pointer = 0;
            }

            if (num_ongoing_calls !== 0) {
                if (kind === 12 || kind === 13) {
                    throw new ReferenceError( "FnMut function called multiple times concurrently!" );
                }
            }

            var args = Module.STDWEB_PRIVATE.alloc( 16 );
            Module.STDWEB_PRIVATE.serialize_array( args, arguments );

            try {
                num_ongoing_calls += 1;
                Module.STDWEB_PRIVATE.dyncall( "vii", adapter_pointer, [function_pointer, args] );
                var result = Module.STDWEB_PRIVATE.tmp;
                Module.STDWEB_PRIVATE.tmp = null;
            } finally {
                num_ongoing_calls -= 1;
            }

            if( drop_queued === true && num_ongoing_calls === 0 ) {
                output.drop();
            }

            return result;
        };

        output.drop = function() {
            if (num_ongoing_calls !== 0) {
                drop_queued = true;
                return;
            }

            output.drop = Module.STDWEB_PRIVATE.noop;
            var function_pointer = pointer;
            pointer = 0;

            if (function_pointer != 0) {
                Module.STDWEB_PRIVATE.dyncall( "vi", deallocator_pointer, [function_pointer] );
            }
        };

        return output;
    } else if( kind === 14 ) {
        var pointer = HEAPU32[ address / 4 ];
        var length = HEAPU32[ (address + 4) / 4 ];
        var array_kind = HEAPU32[ (address + 8) / 4 ];
        var pointer_end = pointer + length;

        switch( array_kind ) {
            case 0:
                return HEAPU8.subarray( pointer, pointer_end );
            case 1:
                return HEAP8.subarray( pointer, pointer_end );
            case 2:
                return HEAPU16.subarray( pointer, pointer_end );
            case 3:
                return HEAP16.subarray( pointer, pointer_end );
            case 4:
                return HEAPU32.subarray( pointer, pointer_end );
            case 5:
                return HEAP32.subarray( pointer, pointer_end );
            case 6:
                return HEAPF32.subarray( pointer, pointer_end );
            case 7:
                return HEAPF64.subarray( pointer, pointer_end );
        }
    } else if( kind === 15 ) {
        return Module.STDWEB_PRIVATE.get_raw_value( HEAPU32[ address / 4 ] );
    }
};

Module.STDWEB_PRIVATE.serialize_object = function serialize_object( address, value ) {
    var keys = Object.keys( value );
    var length = keys.length;
    var key_array_pointer = Module.STDWEB_PRIVATE.alloc( length * 8 );
    var value_array_pointer = Module.STDWEB_PRIVATE.alloc( length * 16 );
    HEAPU8[ address + 12 ] = 8;
    HEAPU32[ address / 4 ] = value_array_pointer;
    HEAPU32[ (address + 4) / 4 ] = length;
    HEAPU32[ (address + 8) / 4 ] = key_array_pointer;
    for( var i = 0; i < length; ++i ) {
        var key = keys[ i ];
        var key_address = key_array_pointer + i * 8;
        Module.STDWEB_PRIVATE.to_utf8_string( key_address, key );

        Module.STDWEB_PRIVATE.from_js( value_array_pointer + i * 16, value[ key ] );
    }
};

Module.STDWEB_PRIVATE.serialize_array = function serialize_array( address, value ) {
    var length = value.length;
    var pointer = Module.STDWEB_PRIVATE.alloc( length * 16 );
    HEAPU8[ address + 12 ] = 7;
    HEAPU32[ address / 4 ] = pointer;
    HEAPU32[ (address + 4) / 4 ] = length;
    for( var i = 0; i < length; ++i ) {
        Module.STDWEB_PRIVATE.from_js( pointer + i * 16, value[ i ] );
    }
};

// New browsers and recent Node
var cachedEncoder = ( typeof TextEncoder === "function"
    ? new TextEncoder( "utf-8" )
    // Old Node (before v11)
    : ( typeof util === "object" && util && typeof util.TextEncoder === "function"
        ? new util.TextEncoder( "utf-8" )
        // Old browsers
        : null ) );

if ( cachedEncoder != null ) {
    Module.STDWEB_PRIVATE.to_utf8_string = function to_utf8_string( address, value ) {
        var buffer = cachedEncoder.encode( value );
        var length = buffer.length;
        var pointer = 0;

        if ( length > 0 ) {
            pointer = Module.STDWEB_PRIVATE.alloc( length );
            HEAPU8.set( buffer, pointer );
        }

        HEAPU32[ address / 4 ] = pointer;
        HEAPU32[ (address + 4) / 4 ] = length;
    };

} else {
    Module.STDWEB_PRIVATE.to_utf8_string = function to_utf8_string( address, value ) {
        var length = Module.STDWEB_PRIVATE.utf8_len( value );
        var pointer = 0;

        if ( length > 0 ) {
            pointer = Module.STDWEB_PRIVATE.alloc( length );
            Module.STDWEB_PRIVATE.to_utf8( value, pointer );
        }

        HEAPU32[ address / 4 ] = pointer;
        HEAPU32[ (address + 4) / 4 ] = length;
    };
}

Module.STDWEB_PRIVATE.from_js = function from_js( address, value ) {
    var kind = Object.prototype.toString.call( value );
    if( kind === "[object String]" ) {
        HEAPU8[ address + 12 ] = 4;
        Module.STDWEB_PRIVATE.to_utf8_string( address, value );
    } else if( kind === "[object Number]" ) {
        if( value === (value|0) ) {
            HEAPU8[ address + 12 ] = 2;
            HEAP32[ address / 4 ] = value;
        } else {
            HEAPU8[ address + 12 ] = 3;
            HEAPF64[ address / 8 ] = value;
        }
    } else if( value === null ) {
        HEAPU8[ address + 12 ] = 1;
    } else if( value === undefined ) {
        HEAPU8[ address + 12 ] = 0;
    } else if( value === false ) {
        HEAPU8[ address + 12 ] = 5;
    } else if( value === true ) {
        HEAPU8[ address + 12 ] = 6;
    } else if( kind === "[object Symbol]" ) {
        var id = Module.STDWEB_PRIVATE.register_raw_value( value );
        HEAPU8[ address + 12 ] = 15;
        HEAP32[ address / 4 ] = id;
    } else {
        var refid = Module.STDWEB_PRIVATE.acquire_rust_reference( value );
        HEAPU8[ address + 12 ] = 9;
        HEAP32[ address / 4 ] = refid;
    }
};

// New browsers and recent Node
var cachedDecoder = ( typeof TextDecoder === "function"
    ? new TextDecoder( "utf-8" )
    // Old Node (before v11)
    : ( typeof util === "object" && util && typeof util.TextDecoder === "function"
        ? new util.TextDecoder( "utf-8" )
        // Old browsers
        : null ) );

if ( cachedDecoder != null ) {
    Module.STDWEB_PRIVATE.to_js_string = function to_js_string( index, length ) {
        return cachedDecoder.decode( HEAPU8.subarray( index, index + length ) );
    };

} else {
    // This is ported from Rust's stdlib; it's faster than
    // the string conversion from Emscripten.
    Module.STDWEB_PRIVATE.to_js_string = function to_js_string( index, length ) {
        index = index|0;
        length = length|0;
        var end = (index|0) + (length|0);
        var output = "";
        while( index < end ) {
            var x = HEAPU8[ index++ ];
            if( x < 128 ) {
                output += String.fromCharCode( x );
                continue;
            }
            var init = (x & (0x7F >> 2));
            var y = 0;
            if( index < end ) {
                y = HEAPU8[ index++ ];
            }
            var ch = (init << 6) | (y & 63);
            if( x >= 0xE0 ) {
                var z = 0;
                if( index < end ) {
                    z = HEAPU8[ index++ ];
                }
                var y_z = ((y & 63) << 6) | (z & 63);
                ch = init << 12 | y_z;
                if( x >= 0xF0 ) {
                    var w = 0;
                    if( index < end ) {
                        w = HEAPU8[ index++ ];
                    }
                    ch = (init & 7) << 18 | ((y_z << 6) | (w & 63));

                    output += String.fromCharCode( 0xD7C0 + (ch >> 10) );
                    ch = 0xDC00 + (ch & 0x3FF);
                }
            }
            output += String.fromCharCode( ch );
            continue;
        }
        return output;
    };
}

Module.STDWEB_PRIVATE.id_to_ref_map = {};
Module.STDWEB_PRIVATE.id_to_refcount_map = {};
Module.STDWEB_PRIVATE.ref_to_id_map = new WeakMap();
// Not all types can be stored in a WeakMap
Module.STDWEB_PRIVATE.ref_to_id_map_fallback = new Map();
Module.STDWEB_PRIVATE.last_refid = 1;

Module.STDWEB_PRIVATE.id_to_raw_value_map = {};
Module.STDWEB_PRIVATE.last_raw_value_id = 1;

Module.STDWEB_PRIVATE.acquire_rust_reference = function( reference ) {
    if( reference === undefined || reference === null ) {
        return 0;
    }

    var id_to_refcount_map = Module.STDWEB_PRIVATE.id_to_refcount_map;
    var id_to_ref_map = Module.STDWEB_PRIVATE.id_to_ref_map;
    var ref_to_id_map = Module.STDWEB_PRIVATE.ref_to_id_map;
    var ref_to_id_map_fallback = Module.STDWEB_PRIVATE.ref_to_id_map_fallback;

    var refid = ref_to_id_map.get( reference );
    if( refid === undefined ) {
        refid = ref_to_id_map_fallback.get( reference );
    }
    if( refid === undefined ) {
        refid = Module.STDWEB_PRIVATE.last_refid++;
        try {
            ref_to_id_map.set( reference, refid );
        } catch (e) {
            ref_to_id_map_fallback.set( reference, refid );
        }
    }

    if( refid in id_to_ref_map ) {
        id_to_refcount_map[ refid ]++;
    } else {
        id_to_ref_map[ refid ] = reference;
        id_to_refcount_map[ refid ] = 1;
    }

    return refid;
};

Module.STDWEB_PRIVATE.acquire_js_reference = function( refid ) {
    return Module.STDWEB_PRIVATE.id_to_ref_map[ refid ];
};

Module.STDWEB_PRIVATE.increment_refcount = function( refid ) {
    Module.STDWEB_PRIVATE.id_to_refcount_map[ refid ]++;
};

Module.STDWEB_PRIVATE.decrement_refcount = function( refid ) {
    var id_to_refcount_map = Module.STDWEB_PRIVATE.id_to_refcount_map;
    if( 0 == --id_to_refcount_map[ refid ] ) {
        var id_to_ref_map = Module.STDWEB_PRIVATE.id_to_ref_map;
        var ref_to_id_map_fallback = Module.STDWEB_PRIVATE.ref_to_id_map_fallback;
        var reference = id_to_ref_map[ refid ];
        delete id_to_ref_map[ refid ];
        delete id_to_refcount_map[ refid ];
        ref_to_id_map_fallback.delete(reference);
    }
};

Module.STDWEB_PRIVATE.register_raw_value = function( value ) {
    var id = Module.STDWEB_PRIVATE.last_raw_value_id++;
    Module.STDWEB_PRIVATE.id_to_raw_value_map[ id ] = value;
    return id;
};

Module.STDWEB_PRIVATE.unregister_raw_value = function( id ) {
    delete Module.STDWEB_PRIVATE.id_to_raw_value_map[ id ];
};

Module.STDWEB_PRIVATE.get_raw_value = function( id ) {
    return Module.STDWEB_PRIVATE.id_to_raw_value_map[ id ];
};

Module.STDWEB_PRIVATE.alloc = function alloc( size ) {
    return Module.web_malloc( size );
};

Module.STDWEB_PRIVATE.dyncall = function( signature, ptr, args ) {
    return Module.web_table.get( ptr ).apply( null, args );
};

// This is based on code from Emscripten's preamble.js.
Module.STDWEB_PRIVATE.utf8_len = function utf8_len( str ) {
    var len = 0;
    for( var i = 0; i < str.length; ++i ) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        var u = str.charCodeAt( i ); // possibly a lead surrogate
        if( u >= 0xD800 && u <= 0xDFFF ) {
            u = 0x10000 + ((u & 0x3FF) << 10) | (str.charCodeAt( ++i ) & 0x3FF);
        }

        if( u <= 0x7F ) {
            ++len;
        } else if( u <= 0x7FF ) {
            len += 2;
        } else if( u <= 0xFFFF ) {
            len += 3;
        } else if( u <= 0x1FFFFF ) {
            len += 4;
        } else if( u <= 0x3FFFFFF ) {
            len += 5;
        } else {
            len += 6;
        }
    }
    return len;
};

Module.STDWEB_PRIVATE.prepare_any_arg = function( value ) {
    var arg = Module.STDWEB_PRIVATE.alloc( 16 );
    Module.STDWEB_PRIVATE.from_js( arg, value );
    return arg;
};

Module.STDWEB_PRIVATE.acquire_tmp = function( dummy ) {
    var value = Module.STDWEB_PRIVATE.tmp;
    Module.STDWEB_PRIVATE.tmp = null;
    return value;
};



    var HEAP8 = null;
    var HEAP16 = null;
    var HEAP32 = null;
    var HEAPU8 = null;
    var HEAPU16 = null;
    var HEAPU32 = null;
    var HEAPF32 = null;
    var HEAPF64 = null;

    Object.defineProperty( Module, 'exports', { value: {} } );

    function __web_on_grow() {
        var buffer = Module.instance.exports.memory.buffer;
        HEAP8 = new Int8Array( buffer );
        HEAP16 = new Int16Array( buffer );
        HEAP32 = new Int32Array( buffer );
        HEAPU8 = new Uint8Array( buffer );
        HEAPU16 = new Uint16Array( buffer );
        HEAPU32 = new Uint32Array( buffer );
        HEAPF32 = new Float32Array( buffer );
        HEAPF64 = new Float64Array( buffer );
    }

    return {
        imports: {
            env: {
                "__cargo_web_snippet_084627c5f73ae0bd1270f1385fc6673b1567650e": function($0) {
                Module.STDWEB_PRIVATE.from_js($0, (function(){var tabcontent=document.getElementsByClassName("tabcontent");return String(tabcontent.length)})());
            },
            "__cargo_web_snippet_08a3b15e1358700ac92bc556f9e9b8af660fc2c7": function($0, $1) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);$1 = Module.STDWEB_PRIVATE.to_js($1);($0).nodeValue=($1);
            },
            "__cargo_web_snippet_0aced9e2351ced72f1ff99645a129132b16c0d3c": function($0) {
                var value = Module.STDWEB_PRIVATE.get_raw_value( $0 );return Module.STDWEB_PRIVATE.register_raw_value( value );
            },
            "__cargo_web_snippet_0d0fd1dc3332b8f76ba298b5d1dc5ef7fe7e359c": function($0) {
                Module.STDWEB_PRIVATE.from_js($0, (function(){var selectBox=document.getElementById("selectDLBox");var selectedValue=selectBox.options[selectBox.selectedIndex].value;return selectedValue})());
            },
            "__cargo_web_snippet_0da47658267a7497de743e1b0892f992ba6ca6ef": function($0, $1) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);$1 = Module.STDWEB_PRIVATE.to_js($1);($0).type=($1);
            },
            "__cargo_web_snippet_0e54fd9c163fcf648ce0a395fde4500fd167a40b": function($0) {
                var r = Module.STDWEB_PRIVATE.acquire_js_reference( $0 );return (r instanceof DOMException) && (r.name === "InvalidCharacterError");
            },
            "__cargo_web_snippet_1229fcd13d651e98ee8c782fe6fd91c1181a4ba6": function($0) {
                Module.STDWEB_PRIVATE.from_js($0, (function(){console.log("Parse State!")})());
            },
            "__cargo_web_snippet_153925dec2c6629b1d391bf8eb91dc56260a84ef": function($0) {
                Module.STDWEB_PRIVATE.from_js($0, (function(){var tmp=document.getElementById("bild").dataset.counter;return tmp})());
            },
            "__cargo_web_snippet_1b99afb18ade608620e7b3b71620c9f2ae33c5fd": function($0) {
                Module.STDWEB_PRIVATE.from_js($0, (function(){console.log("NOTFOUND!");document.getElementById("bild").dataset.counter=0;document.getElementById("selectDLBox").style.display="none";var dlbuttons=document.getElementsByClassName("dlbutton");for(var i=0;i<dlbuttons.length;i++){dlbuttons[i].style.display="none";}})());
            },
            "__cargo_web_snippet_351b27505bc97d861c3914c20421b6277babb53b": function($0) {
                var o = Module.STDWEB_PRIVATE.acquire_js_reference( $0 );return (o instanceof Node) | 0;
            },
            "__cargo_web_snippet_352943ae98b2eeb817e36305c3531d61c7e1a52b": function($0) {
                var o = Module.STDWEB_PRIVATE.acquire_js_reference( $0 );return (o instanceof Element) | 0;
            },
            "__cargo_web_snippet_35be0ed5290143140bb423ae9ddacd0ff4d5c142": function($0) {
                var o = Module.STDWEB_PRIVATE.acquire_js_reference( $0 );return (o instanceof MouseEvent && o.type === "dblclick") | 0;
            },
            "__cargo_web_snippet_46518012593da937dd5f35c2fc1c5e1dcade260b": function($0, $1, $2, $3) {
                $1 = Module.STDWEB_PRIVATE.to_js($1);$2 = Module.STDWEB_PRIVATE.to_js($2);$3 = Module.STDWEB_PRIVATE.to_js($3);Module.STDWEB_PRIVATE.from_js($0, (function(){try{return{value:function(){return($1).insertBefore(($2),($3));}(),success:true};}catch(error){return{error:error,success:false};}})());
            },
            "__cargo_web_snippet_472ce2f06f6499ce6e0a5b2f2f39b9dc1aa791b3": function($0) {
                Module.STDWEB_PRIVATE.from_js($0, (function(){var input=document.getElementById("uml_diagramm");return String(input.innerHTML)})());
            },
            "__cargo_web_snippet_504ce182293607c2ac8c78716af59e38309b0889": function($0) {
                Module.STDWEB_PRIVATE.from_js($0, (function(){console.log("Parse Class!")})());
            },
            "__cargo_web_snippet_513cc5b95412492d529556ccd01ecd4a671a4df8": function($0) {
                var o = Module.STDWEB_PRIVATE.acquire_js_reference( $0 );return (o instanceof Event && o.type === "input") | 0;
            },
            "__cargo_web_snippet_614a3dd2adb7e9eac4a0ec6e59d37f87e0521c3b": function($0, $1) {
                $1 = Module.STDWEB_PRIVATE.to_js($1);Module.STDWEB_PRIVATE.from_js($0, (function(){return($1).error;})());
            },
            "__cargo_web_snippet_6370803b18095c4a1b40b432ee9cff6ed7f64260": function($0, $1) {
                $1 = Module.STDWEB_PRIVATE.to_js($1);Module.STDWEB_PRIVATE.from_js($0, (function(){var svg=document.getElementsByClassName("tabcontent")[($1)].cloneNode(true);var newParent=svg.firstChild;var oldParent=svg.firstChild.firstChild;while(oldParent.childNodes.length>0){newParent.appendChild(oldParent.childNodes[0]);}oldParent.remove();svg=svg.innerHTML;var canvas=document.createElement("canvas");canvas.height=1080;canvas.width=1920;var ctx=canvas.getContext("2d");var image=new Image();image.src="data:image/svg+xml,"+svg;image.onload=function(){ctx.drawImage(image,0,0);var a=document.createElement("a");a.download="diagramm.png";a.href=canvas.toDataURL("image/png");a.click();};})());
            },
            "__cargo_web_snippet_690311d2f9134ac0983620c38a9e6460d4165607": function($0, $1) {
                $1 = Module.STDWEB_PRIVATE.to_js($1);Module.STDWEB_PRIVATE.from_js($0, (function(){return($1).nextSibling;})());
            },
            "__cargo_web_snippet_6a77b2f2accec26fefbfa0d864061d26f40f8f6f": function($0) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);($0).type="";
            },
            "__cargo_web_snippet_6fcce0aae651e2d748e085ff1f800f87625ff8c8": function($0) {
                Module.STDWEB_PRIVATE.from_js($0, (function(){return document;})());
            },
            "__cargo_web_snippet_72fc447820458c720c68d0d8e078ede631edd723": function($0, $1, $2) {
                console.error( 'Panic location:', Module.STDWEB_PRIVATE.to_js_string( $0, $1 ) + ':' + $2 );
            },
            "__cargo_web_snippet_7c8dfab835dc8a552cd9d67f27d26624590e052c": function($0) {
                var r = Module.STDWEB_PRIVATE.acquire_js_reference( $0 );return (r instanceof DOMException) && (r.name === "SyntaxError");
            },
            "__cargo_web_snippet_7d3fef281128b490954e701c65e708c595127957": function($0) {
                Module.STDWEB_PRIVATE.from_js($0, (function(){console.log("Parse Action!")})());
            },
            "__cargo_web_snippet_80d6d56760c65e49b7be8b6b01c1ea861b046bf0": function($0) {
                Module.STDWEB_PRIVATE.decrement_refcount( $0 );
            },
            "__cargo_web_snippet_814a40dbecbb595e5310fbdd85c514257daec527": function($0) {
                Module.STDWEB_PRIVATE.from_js($0, (function(){console.log("Parse Usecase!")})());
            },
            "__cargo_web_snippet_8545f3ba2883a49a2afd23c48c5d24ef3f9b0071": function($0) {
                var o = Module.STDWEB_PRIVATE.acquire_js_reference( $0 );return (o instanceof HTMLTextAreaElement) | 0;
            },
            "__cargo_web_snippet_85b9ecbdb8513465b790546acfd0cd530441b8a4": function($0) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);($0).stopPropagation();
            },
            "__cargo_web_snippet_8a049af1e4867892fca647811a9472e4c5832053": function($0, $1) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);$1 = Module.STDWEB_PRIVATE.to_js($1);($0).add(($1));
            },
            "__cargo_web_snippet_906f13b1e97c3e6e6996c62d7584c4917315426d": function($0) {
                var o = Module.STDWEB_PRIVATE.acquire_js_reference( $0 );return (o instanceof MouseEvent && o.type === "click") | 0;
            },
            "__cargo_web_snippet_91749aeb589cd0f9b17cbc01b2872ba709817982": function($0, $1, $2) {
                $1 = Module.STDWEB_PRIVATE.to_js($1);$2 = Module.STDWEB_PRIVATE.to_js($2);Module.STDWEB_PRIVATE.from_js($0, (function(){try{return{value:function(){return($1).createElement(($2));}(),success:true};}catch(error){return{error:error,success:false};}})());
            },
            "__cargo_web_snippet_96019afc94417ba3716a0fc16a6f6bb0b478a037": function($0) {
                var o = Module.STDWEB_PRIVATE.acquire_js_reference( $0 );return (o instanceof HTMLSelectElement) | 0;
            },
            "__cargo_web_snippet_96045277a21e9ac42d5db9be14c84bf84fc16151": function($0, $1) {
                $1 = Module.STDWEB_PRIVATE.to_js($1);Module.STDWEB_PRIVATE.from_js($0, (function(){var svg=document.getElementsByClassName("tabcontent")[($1)].cloneNode(true);var newParent=svg.firstChild;var oldParent=svg.firstChild.firstChild;while(oldParent.childNodes.length>0){newParent.appendChild(oldParent.childNodes[0]);}oldParent.remove();svg=svg.firstChild;var serializer=new XMLSerializer();var source=serializer.serializeToString(svg);source="<?xml version='1.0' standalone='no'?>\r\n"+source;var url="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(source);var a=document.createElement("a");a.download="diagramm.svg";a.href=url;a.click();})());
            },
            "__cargo_web_snippet_97495987af1720d8a9a923fa4683a7b683e3acd6": function($0, $1) {
                console.error( 'Panic error message:', Module.STDWEB_PRIVATE.to_js_string( $0, $1 ) );
            },
            "__cargo_web_snippet_99c4eefdc8d4cc724135163b8c8665a1f3de99e4": function($0, $1, $2, $3) {
                $1 = Module.STDWEB_PRIVATE.to_js($1);$2 = Module.STDWEB_PRIVATE.to_js($2);$3 = Module.STDWEB_PRIVATE.to_js($3);Module.STDWEB_PRIVATE.from_js($0, (function(){var listener=($1);($2).addEventListener(($3),listener);return listener;})());
            },
            "__cargo_web_snippet_9bb69d8170fbce892ba4900d8824aa142e63adf6": function($0, $1) {
                $1 = Module.STDWEB_PRIVATE.to_js($1);Module.STDWEB_PRIVATE.from_js($0, (function(){return($1).nodeName;})());
            },
            "__cargo_web_snippet_9f22d4ca7bc938409787341b7db181f8dd41e6df": function($0) {
                Module.STDWEB_PRIVATE.increment_refcount( $0 );
            },
            "__cargo_web_snippet_a152e8d0e8fac5476f30c1d19e4ab217dbcba73d": function($0, $1, $2) {
                $1 = Module.STDWEB_PRIVATE.to_js($1);$2 = Module.STDWEB_PRIVATE.to_js($2);Module.STDWEB_PRIVATE.from_js($0, (function(){try{return{value:function(){return($1).querySelector(($2));}(),success:true};}catch(error){return{error:error,success:false};}})());
            },
            "__cargo_web_snippet_a1f43b583e011a9bbeae64030b81f677e6c29005": function($0, $1) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);$1 = Module.STDWEB_PRIVATE.to_js($1);($0).checked=($1);
            },
            "__cargo_web_snippet_a31b74e3eacb73890173b606c1c22bfeb8fc5e8d": function($0) {
                Module.STDWEB_PRIVATE.from_js($0, (function(){console.log("Parse Sequence!")})());
            },
            "__cargo_web_snippet_a3689c45d9e9d5c170cf1a5c5ee62a4ac82c6827": function($0) {
                Module.STDWEB_PRIVATE.from_js($0, (function(){console.log("Parse Object!")})());
            },
            "__cargo_web_snippet_ab05f53189dacccf2d365ad26daa407d4f7abea9": function($0, $1) {
                $1 = Module.STDWEB_PRIVATE.to_js($1);Module.STDWEB_PRIVATE.from_js($0, (function(){return($1).value;})());
            },
            "__cargo_web_snippet_afafe9a462a05084fec65cacc7d6598e145ff3e3": function($0, $1, $2) {
                $1 = Module.STDWEB_PRIVATE.to_js($1);$2 = Module.STDWEB_PRIVATE.to_js($2);Module.STDWEB_PRIVATE.from_js($0, (function(){return($1).createTextNode(($2));})());
            },
            "__cargo_web_snippet_b06dde4acf09433b5190a4b001259fe5d4abcbc2": function($0, $1) {
                $1 = Module.STDWEB_PRIVATE.to_js($1);Module.STDWEB_PRIVATE.from_js($0, (function(){return($1).success;})());
            },
            "__cargo_web_snippet_b2149f7db806f0c591dedf60aaa15e351cbd8bb1": function($0) {
                Module.STDWEB_PRIVATE.from_js($0, (function(){return document.getElementById("bild").dataset.counter})());
            },
            "__cargo_web_snippet_ba3705cbd8345de59faafb8ffd06749c3c99e1e3": function($0) {
                Module.STDWEB_PRIVATE.from_js($0, (function(){document.getElementById("selectBox").selectedIndex="0";})());
            },
            "__cargo_web_snippet_badc5645a6f40fc8b9a3b1411242dfde4607e262": function($0) {
                Module.STDWEB_PRIVATE.from_js($0, (function(){var bild=document.getElementById("bild");while(bild.firstChild){bild.removeChild(bild.firstChild);}var tab=document.createElement("div");tab.classList.add("tab");bild.appendChild(tab);document.getElementById("selectDLBox").style.display="inline";var dlbuttons=document.getElementsByClassName("dlbutton");for(var i=0;i<dlbuttons.length;i++){dlbuttons[i].style.display="inline";}})());
            },
            "__cargo_web_snippet_bb618d13cbb219642bd219af99ee1519e5658d77": function($0, $1) {
                $1 = Module.STDWEB_PRIVATE.to_js($1);Module.STDWEB_PRIVATE.from_js($0, (function(){return($1).classList;})());
            },
            "__cargo_web_snippet_c023351d5bff43ef3dd317b499821cd4e71492f0": function($0) {
                var r = Module.STDWEB_PRIVATE.acquire_js_reference( $0 );return (r instanceof DOMException) && (r.name === "HierarchyRequestError");
            },
            "__cargo_web_snippet_c26ddf75f581148e029dfcd95c037bb50d502e43": function($0, $1) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);$1 = Module.STDWEB_PRIVATE.to_js($1);($0).value=($1);
            },
            "__cargo_web_snippet_c408bf30a47691eac1191efc4392544ab6ebe404": function($0) {
                Module.STDWEB_PRIVATE.from_js($0, (function(){console.log("Parse Component!")})());
            },
            "__cargo_web_snippet_cb392b71162553130760deeb3964fa828c078f74": function($0) {
                var o = Module.STDWEB_PRIVATE.acquire_js_reference( $0 );return (o instanceof HTMLInputElement) | 0;
            },
            "__cargo_web_snippet_cd41a77d0178ae27c833ef2950e5f1a48a1455c1": function($0, $1, $2) {
                $1 = Module.STDWEB_PRIVATE.to_js($1);$2 = Module.STDWEB_PRIVATE.to_js($2);Module.STDWEB_PRIVATE.from_js($0, (function(){try{return{value:function(){return($1).removeChild(($2));}(),success:true};}catch(error){return{error:error,success:false};}})());
            },
            "__cargo_web_snippet_da2febd72f9938d90bc2bf2905643f595b07abd9": function($0, $1, $2) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);$1 = Module.STDWEB_PRIVATE.to_js($1);$2 = Module.STDWEB_PRIVATE.to_js($2);($0).setAttribute(($1),($2));
            },
            "__cargo_web_snippet_dc2fd915bd92f9e9c6a3bd15174f1414eee3dbaf": function() {
                console.error( 'Encountered a panic!' );
            },
            "__cargo_web_snippet_de2896a7ccf316486788a4d0bc433c25d2f1a12b": function($0) {
                var r = Module.STDWEB_PRIVATE.acquire_js_reference( $0 );return (r instanceof DOMException) && (r.name === "NotFoundError");
            },
            "__cargo_web_snippet_df1af574cd9baa760fe7430987d2e2ab3c50585f": function($0, $1, $2, $3, $4, $5, $6, $7, $8) {
                $1 = Module.STDWEB_PRIVATE.to_js($1);$2 = Module.STDWEB_PRIVATE.to_js($2);$3 = Module.STDWEB_PRIVATE.to_js($3);$4 = Module.STDWEB_PRIVATE.to_js($4);$5 = Module.STDWEB_PRIVATE.to_js($5);$6 = Module.STDWEB_PRIVATE.to_js($6);$7 = Module.STDWEB_PRIVATE.to_js($7);$8 = Module.STDWEB_PRIVATE.to_js($8);Module.STDWEB_PRIVATE.from_js($0, (function(){var panOptions={viewportSelector:".svg-pan-zoom_viewport",panEnabled:true,controlIconsEnabled:false,zoomEnabled:true,dblClickZoomEnabled:false,mouseWheelZoomEnabled:true,preventMouseEventsDefault:true,zoomScaleSensitivity:0.2,minZoom:0.5,maxZoom:10,fit:false,contain:true,center:false,refreshRate:"auto"};var button=document.createElement("button");button.classList.add("tablinks");if(($1)==($2)){button.classList.add("active");}button.onclick=function(){var i,tabcontent,tablinks;tabcontent=document.getElementsByClassName("tabcontent");for(i=0;i<tabcontent.length;i++){if(i==document.getElementById("bild").dataset.counter){svgPanZoom(tabcontent[i].firstChild).destroy();tabcontent[i].style.display="none";var newParent=tabcontent[i].firstChild;var oldParent=newParent.firstChild;while(oldParent.childNodes.length>0){newParent.appendChild(oldParent.childNodes[0]);}}}var vp=document.getElementsByClassName("svg-pan-zoom_viewport");while(vp[0]){vp[0].parentNode.removeChild(vp[0]);}var p=0;tablinks=document.getElementsByClassName("tablinks");for(i=0;i<tablinks.length;i++){tablinks[i].className=tablinks[i].className.replace(" active","");if(tablinks[i]==this){this.classList.add("active");p=i;var tmp=document.getElementById("bild");tmp.dataset.counter=i;}}var tc=document.getElementsByClassName("tabcontent");for(i=0;i<=p;i++){if(i==p){tc[i].style.display="block";tc[i].firstChild.setAttribute("viewBox","0 0 1680 720");svgPanZoom(tc[i].firstChild,panOptions);}}};button.value="d_"+($3);button.innerHTML=($4);var tab=document.getElementsByClassName("tab");for(var i=0;i<tab.length;i++){tab[i].appendChild(button);}var tabcontent=document.createElement("div");tabcontent.classList.add("tabcontent");tabcontent.id="d_"+($5);tabcontent.innerHTML=($6);document.getElementById("bild").appendChild(tabcontent);if(($7)==($8)){tabcontent.style.display="block";svgPanZoom(tabcontent.firstChild,panOptions);}})());
            },
            "__cargo_web_snippet_e2024ff4b0797f9c301f2eb809c35d0c3e8faa0d": function($0) {
                Module.STDWEB_PRIVATE.from_js($0, (function(){return document.getElementById("eingabefeld").value})());
            },
            "__cargo_web_snippet_e741b9d9071097746386b2c2ec044a2bc73e688c": function($0, $1) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);$1 = Module.STDWEB_PRIVATE.to_js($1);($0).appendChild(($1));
            },
            "__cargo_web_snippet_e9638d6405ab65f78daf4a5af9c9de14ecf1e2ec": function($0) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);Module.STDWEB_PRIVATE.unregister_raw_value(($0));
            },
            "__cargo_web_snippet_ec28a01a0e33da46726388bff28c564a3ae5afa3": function($0) {
                var o = Module.STDWEB_PRIVATE.acquire_js_reference( $0 );return (o instanceof Event && o.type === "change") | 0;
            },
            "__cargo_web_snippet_ec62bad51093fd25faa38be3170e100862e191f3": function($0, $1) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);$1 = Module.STDWEB_PRIVATE.to_js($1);($0).remove(($1));
            },
            "__cargo_web_snippet_ef03390ac05604030d595155d7c0fd2d53f16728": function($0, $1, $2, $3, $4, $5, $6, $7, $8) {
                $1 = Module.STDWEB_PRIVATE.to_js($1);$2 = Module.STDWEB_PRIVATE.to_js($2);$3 = Module.STDWEB_PRIVATE.to_js($3);$4 = Module.STDWEB_PRIVATE.to_js($4);$5 = Module.STDWEB_PRIVATE.to_js($5);$6 = Module.STDWEB_PRIVATE.to_js($6);$7 = Module.STDWEB_PRIVATE.to_js($7);$8 = Module.STDWEB_PRIVATE.to_js($8);Module.STDWEB_PRIVATE.from_js($0, (function(){var panOptions={viewportSelector:".svg-pan-zoom_viewport",panEnabled:true,controlIconsEnabled:false,zoomEnabled:true,dblClickZoomEnabled:true,mouseWheelZoomEnabled:true,preventMouseEventsDefault:true,zoomScaleSensitivity:0.2,minZoom:0.5,maxZoom:10,fit:false,contain:true,center:false,refreshRate:"auto"};var button=document.createElement("button");button.classList.add("tablinks");if(($1)==($2)){button.classList.add("active");}button.onclick=function(){var i,tabcontent,tablinks;tabcontent=document.getElementsByClassName("tabcontent");for(i=0;i<tabcontent.length;i++){if(i==document.getElementById("bild").dataset.counter){svgPanZoom(tabcontent[i].firstChild).destroy();tabcontent[i].style.display="none";var newParent=tabcontent[i].firstChild;var oldParent=newParent.firstChild;while(oldParent.childNodes.length>0){newParent.appendChild(oldParent.childNodes[0]);}}}var vp=document.getElementsByClassName("svg-pan-zoom_viewport");while(vp[0]){vp[0].parentNode.removeChild(vp[0]);}var p=0;tablinks=document.getElementsByClassName("tablinks");for(i=0;i<tablinks.length;i++){tablinks[i].className=tablinks[i].className.replace(" active","");if(tablinks[i]==this){this.classList.add("active");p=i;var tmp=document.getElementById("bild");tmp.dataset.counter=i;}}var tc=document.getElementsByClassName("tabcontent");for(i=0;i<=p;i++){if(i==p){tc[i].style.display="block";tc[i].firstChild.setAttribute("viewBox","0 0 1680 720");svgPanZoom(tc[i].firstChild,panOptions);}}};button.value="d_"+($3);button.innerHTML=($4);var tab=document.getElementsByClassName("tab");for(var i=0;i<tab.length;i++){tab[i].appendChild(button);}var tabcontent=document.createElement("div");tabcontent.classList.add("tabcontent");tabcontent.id="d_"+($5);tabcontent.innerHTML=($6);document.getElementById("bild").appendChild(tabcontent);if(($7)==($8)){tabcontent.style.display="block";svgPanZoom(tabcontent.firstChild,panOptions);}})());
            },
            "__cargo_web_snippet_f03767d5868baf486b51c1e3988d0ce100e850ca": function($0, $1) {
                $1 = Module.STDWEB_PRIVATE.to_js($1);Module.STDWEB_PRIVATE.from_js($0, (function(){return($1).lastChild;})());
            },
            "__cargo_web_snippet_f430c3c3fb8e2a47b63d0f6f762bc4a27dfdc701": function($0, $1, $2, $3) {
                $1 = Module.STDWEB_PRIVATE.to_js($1);$2 = Module.STDWEB_PRIVATE.to_js($2);$3 = Module.STDWEB_PRIVATE.to_js($3);Module.STDWEB_PRIVATE.from_js($0, (function(){var txtarea=document.getElementById(($1));var scrollPos=txtarea.scrollTop;var strPos=0;var br=((txtarea.selectionStart||txtarea.selectionStart=='0')?"ff":(document.selection?"ie":false));if(br=="ie"){txtarea.focus();var range=document.selection.createRange();range.moveStart("character",-txtarea.value.length);strPos=range.text.length;}else if(br=="ff")strPos=txtarea.selectionStart;var front=(txtarea.value).substring(0,strPos);var back=(txtarea.value).substring(strPos,txtarea.value.length);txtarea.value=front+($2)+back;strPos=strPos+($3).length;if(br=="ie"){txtarea.focus();var range=document.selection.createRange();range.moveStart("character",-txtarea.value.length);range.moveStart("character",strPos);range.moveEnd("character",0);range.select();}else if(br=="ff"){txtarea.selectionStart=strPos;txtarea.selectionEnd=strPos;txtarea.focus();}txtarea.scrollTop=scrollPos;})());
            },
            "__cargo_web_snippet_f6358c198ebcc61c9da370cca2679c0b8bc81a7b": function($0, $1) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);$1 = Module.STDWEB_PRIVATE.to_js($1);($0).removeAttribute(($1));
            },
            "__cargo_web_snippet_f721afbd9cb4ae0220312ed8982244f26fe55f59": function($0) {
                Module.STDWEB_PRIVATE.from_js($0, (function(){console.log("Parse Deployment!")})());
            },
            "__cargo_web_snippet_f750c7bda400081b4d7209f43f9d59214d39f6ea": function($0, $1, $2) {
                $0 = Module.STDWEB_PRIVATE.to_js($0);$1 = Module.STDWEB_PRIVATE.to_js($1);$2 = Module.STDWEB_PRIVATE.to_js($2);var listener=($0);($1).removeEventListener(($2),listener);listener.drop();
            },
            "__cargo_web_snippet_fed74890a4047de44758c23d1fb98a3b928fe2e5": function($0) {
                Module.STDWEB_PRIVATE.from_js($0, (function(){console.log("Parse Package!")})());
            },
            "__cargo_web_snippet_ff5103e6cc179d13b4c7a785bdce2708fd559fc0": function($0) {
                Module.STDWEB_PRIVATE.tmp = Module.STDWEB_PRIVATE.to_js( $0 );
            },
            "__cargo_web_snippet_ff7daf7e95ced5e8091fb703331944b69241d0ae": function($0) {
                Module.STDWEB_PRIVATE.from_js($0, (function(){var selectBox=document.getElementById("selectBox");var selectedValue=selectBox.options[selectBox.selectedIndex].value;return selectedValue})());
            },
                "__web_on_grow": __web_on_grow
            }
        },
        initialize: function( instance ) {
            Object.defineProperty( Module, 'instance', { value: instance } );
            Object.defineProperty( Module, 'web_malloc', { value: Module.instance.exports.__web_malloc } );
            Object.defineProperty( Module, 'web_free', { value: Module.instance.exports.__web_free } );
            Object.defineProperty( Module, 'web_table', { value: Module.instance.exports.__indirect_function_table } );

            
            __web_on_grow();
            Module.instance.exports.main();

            return Module.exports;
        }
    };
}
 ));
}));
