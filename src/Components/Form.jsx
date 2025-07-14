import React from 'react';
import { useForm } from 'react-hook-form';

const Form = ({ fields, onSubmit, initialData = {}, onCancel, submitText = 'Submit', layout = 'grid-cols-1', cancelText = 'Cancel', resetForm }) => {
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: fields.reduce((acc, field) => ({
      ...acc,
      [field.name]: initialData[field.name] || (field.type === 'select' ? '' : ''),
    }), {}),
  });

  // Solo reiniciar el formulario si initialData tiene datos relevantes
  React.useEffect(() => {
    const hasData = Object.keys(initialData).some(
      (key) => initialData[key] !== undefined && initialData[key] !== ''
    );
    if (hasData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  // Exponer la función reset al componente padre
  React.useImperativeHandle(resetForm, () => ({
    reset: () => reset(fields.reduce((acc, field) => ({
      ...acc,
      [field.name]: field.type === 'select' ? '' : '',
    }), {})),
  }));

  // Función para verificar si un valor es una URL de audio MP3
  const isAudioUrl = (value) => {
    if (typeof value !== 'string') return false;
    return value.toLowerCase().endsWith('.mp3');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`space-y-4 grid ${layout} gap-4`}>
      {fields.map((field, index) => {
        const fieldValue = watch(field.name);
        const showAudioPlayer = isAudioUrl(fieldValue);
        
        // Ocultar completamente el campo 'title_url' si está vacío
        if (field.name === 'title_url' && !fieldValue) {
          return null;
        }

        return (
          <div key={index} className="mb-4">
            <label className="block text-gray-700">{field.label}</label>
            
            {showAudioPlayer ? (
              <div className="mt-2">
                <audio controls className="w-full">
                  <source src={fieldValue} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
                <input
                  type="hidden"
                  {...register(field.name, field.validation || {})}
                />
              </div>
            ) : field.type === 'select' ? (
              <select
                {...register(field.name, field.validation || {})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-Paleta-Celeste focus:border-Paleta-Celeste"
              >
                {field.options.map((option, optIndex) => (
                  <option key={optIndex} value={option.value}>{option.label}</option>
                ))}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea
                {...register(field.name, field.validation || {})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-Paleta-Celeste focus:border-Paleta-Celeste placeholder-gray-500"
                placeholder={`Enter ${field.label.toLowerCase()}`}
                rows="4"
              />
            ) : (
              <input
                type={field.type || 'text'}
                {...register(field.name, field.validation || {})}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-Paleta-Celeste focus:border-Paleta-Celeste placeholder-gray-500"
                placeholder={`Enter ${field.label.toLowerCase()}`}
              />
            )}
            {errors[field.name] && <p className="text-red-500 text-sm mt-1">{errors[field.name].message}</p>}
          </div>
        );
      })}
      <div className="flex justify-end gap-2 col-span-full">
        <button
          type="button"
          onClick={onCancel}
          className="py-2 px-4 bg-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-400 transition duration-300 ease-in-out"
        >
          {cancelText}
        </button>
        <button
          type="submit"
          className="py-2 px-4 bg-Paleta-Celeste text-white font-semibold rounded-md hover:bg-Paleta-VerdeSuave transition duration-300 ease-in-out"
        >
          {submitText}
        </button>
      </div>
    </form>
  );
};

export default React.forwardRef((props, ref) => <Form {...props} resetForm={ref} />);