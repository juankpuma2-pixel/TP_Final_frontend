import React, { useState, useRef, useEffect } from 'react';
import { subirImagen } from '../services/api';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_TAMANO_BYTES = 2 * 1024 * 1024; // 2 MB

/**
 * Componente Formulario / Vista Previa de Imagen según los requerimientos de la Clase 10:
 * 1. Input de archivo no controlado con `value`, usando `useRef` para limpiarlo al terminar.
 * 2. `onChange` guarda el objeto `File` (`e.target.files[0]`) en el estado `archivo`.
 * 3. Validaciones de cortesía: tamaño <= 2MB y tipo de archivo permitido (JPEG, PNG, WebP).
 * 4. Vista previa local con `URL.createObjectURL(file)` en el estado `preview`.
 * 5. `useEffect` para limpiar la memoria ejecutando `URL.revokeObjectURL(preview)` al cambiar o desmontar.
 * 6. Botón de envío habilitado únicamente con archivo elegido, muestra "Subiendo..." y deshabilitado mientras dura el fetch.
 */
export function SubirImagenProducto({
  productoId,
  productoNombre = '',
  onSuccess,
  onCancelar,
}) {
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);

  // Input NO controlado por `value` -> se utiliza `useRef`
  const fileInputRef = useRef(null);

  // Limpieza de memoria con URL.revokeObjectURL al cambiar la vista previa o desmontar el componente
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileChange = (e) => {
    setErrorValidacion(null);
    setMensajeExito(null);

    const file = e.target.files?.[0];
    if (!file) {
      setArchivo(null);
      setPreview(null);
      return;
    }

    // Validación de cortesía en el cliente: Formatos permitidos
    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      setErrorValidacion('Formato no válido. Solo se admiten imágenes en formato JPEG, PNG o WebP.');
      setArchivo(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validación de cortesía en el cliente: Tamaño máximo 2 MB
    if (file.size > MAX_TAMANO_BYTES) {
      setErrorValidacion('El archivo excede el tamaño máximo permitido de 2 MB.');
      setArchivo(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Guardar objeto File y generar vista previa local en memoria
    setArchivo(file);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
  };

  const handleLimpiar = () => {
    setArchivo(null);
    setPreview(null);
    setErrorValidacion(null);
    setMensajeExito(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!archivo || subiendo) return;

    setSubiendo(true);
    setErrorValidacion(null);
    setMensajeExito(null);

    try {
      const respuesta = await subirImagen(productoId, archivo);
      setMensajeExito('¡Imagen subida y actualizada con éxito!');

      // Limpiar input file no controlado y estados al finalizar exitosamente
      handleLimpiar();

      if (onSuccess) {
        onSuccess(respuesta);
      }
    } catch (err) {
      setErrorValidacion(err.message || 'Ocurrió un error al subir la imagen.');
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="card-athletic rounded-2xl p-5 border border-white/10 space-y-4">
      {productoNombre && (
        <div className="border-b border-white/10 pb-2">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
            Subir Imagen Oficial
          </span>
          <h4 className="font-display text-sm font-bold text-white line-clamp-1">
            {productoNombre} <span className="text-xs text-[#00ff66] font-mono">#{productoId}</span>
          </h4>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input de archivo NO controlado con value */}
        <div>
          <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
            Seleccionar archivo de imagen <span className="text-[#00ff66]">*</span>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={subiendo}
            className="block w-full text-xs text-neutral-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-wider file:bg-[#00ff66]/15 file:text-[#00ff66] hover:file:bg-[#00ff66]/25 file:cursor-pointer cursor-pointer border border-white/10 rounded-xl bg-[#0b0c10] p-2 focus:outline-none focus:border-[#00ff66]/50 transition-colors"
          />
          <p className="text-[11px] text-neutral-500 mt-1">
            Formatos admitidos: JPEG, PNG, WEBP. Tamaño máximo: 2 MB.
          </p>
        </div>

        {/* Vista previa local */}
        {preview && (
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
              Vista previa local:
            </span>
            <div className="flex items-center gap-4">
              <div className="relative w-32 aspect-square rounded-xl overflow-hidden border border-[#00ff66]/40 bg-[#07080a] shadow-lg flex-shrink-0">
                <img
                  src={preview}
                  alt="Vista previa del producto"
                  className="w-full h-full object-cover"
                />
              </div>
              {archivo && (
                <div className="text-xs space-y-1 text-neutral-300">
                  <p className="font-bold text-white break-all">{archivo.name}</p>
                  <p className="text-neutral-400 font-mono text-[11px]">
                    {(archivo.size / (1024 * 1024)).toFixed(2)} MB • {archivo.type}
                  </p>
                  <button
                    type="button"
                    onClick={handleLimpiar}
                    disabled={subiendo}
                    className="text-[11px] text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer disabled:opacity-40"
                  >
                    Quitar selección
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notificaciones de error o éxito */}
        {errorValidacion && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-start gap-2">
            <span className="text-base leading-none">⚠️</span>
            <span className="leading-relaxed">{errorValidacion}</span>
          </div>
        )}

        {mensajeExito && (
          <div className="p-3 bg-[#00ff66]/10 border border-[#00ff66]/30 text-[#00ff66] text-xs rounded-xl flex items-center gap-2">
            <span className="text-base leading-none">✓</span>
            <span>{mensajeExito}</span>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            disabled={!archivo || subiendo}
            className="flex-1 btn-volt py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <span>{subiendo ? 'Subiendo...' : 'Subir Imagen'}</span>
            {subiendo && <span className="animate-spin text-sm">⚡</span>}
          </button>

          {onCancelar && (
            <button
              type="button"
              onClick={onCancelar}
              disabled={subiendo}
              className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-neutral-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-40 cursor-pointer"
            >
              Cerrar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default SubirImagenProducto;
