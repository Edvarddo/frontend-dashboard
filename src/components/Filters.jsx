import MultiSelect from './MultiSelect';
import DatePicker from './DatePicker';
import { Button } from "@/components/ui/button"
import { Download } from 'lucide-react'
import { capitalizeFirstLetter } from '@/lib/utils';

const Filters = ({ clearValues, categorias, situaciones, departamentos, juntasVecinales, setFiltrosObj, filtrosObj, dateRange, setDateRange, setIsValid, isValid, loading, handleDownload, limpiarFiltros, aplicarFiltros, showDownload, isDownloadAvailable }) => {
  console.log('situaciones!!',situaciones)
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div>
          <h2 className="mb-2 font-semibold">Categoría</h2>
          <div>
            <MultiSelect clearValues={clearValues} options={categorias} onValueChange={(val) => {
              setFiltrosObj({ ...filtrosObj, categoria: val })
            }} />
          </div>
        </div>
        <div>
          <h2 className="mb-2 font-semibold">Estado de la publicación</h2>
          <div>
            <MultiSelect clearValues={clearValues} options={situaciones} onValueChange={(val) => {
              setFiltrosObj({ ...filtrosObj, situacion: val })
            }} />
          </div>
        </div>
        <div>
          <h2 className="mb-2 font-semibold">Rango de fechas</h2>
          <DatePicker
            dateRange={dateRange}
            setDateRange={setDateRange}
            setIsValid={setIsValid}
          />
        </div>
        <div>
          <h2 className="mb-2 font-semibold">Junta vecinal</h2>
          <div>
            <MultiSelect clearValues={clearValues} options={juntasVecinales} onValueChange={(val) => {
              setFiltrosObj({ ...filtrosObj, junta: val })
            }} />
          </div>
        </div>
        <div>
          <h2 className="mb-2 font-semibold">Departamento</h2>
          <div>
            <MultiSelect clearValues={clearValues} options={departamentos} onValueChange={(val) => {
              setFiltrosObj({ ...filtrosObj, departamentos: val })
            }} />
          </div>
        </div>
      </div>

      <div className="flex justify-between flex-wrap mb-6 btn-section p-1">
        {showDownload ? (
          <Button disabled={loading || !isDownloadAvailable} variant="outline" onClick={handleDownload} className="mb-3 bg-blue-500 hover:bg-blue-600 filter-btn w-full md:w-[unset]">
            <span className="text-white flex justify-items-center justify-center">
              <Download className="mr-2 h-4 w-4" />
              Descargar datos
            </span>
          </Button>
        ) : (
          <div className='mb-3 w-full md:w-[unset]'></div>
        )}

        <div className="filter-btn-cont w-full md:w-[unset]">
          <Button onClick={limpiarFiltros} className="w-full mb-2 mr-2 md:w-[unset] filter-btn" variant="outline">Limpiar filtros</Button>
          <Button disabled={isValid} onClick={aplicarFiltros} className="w-full md:w-[unset] bg-green-500 hover:bg-green-600 text-white filter-btn">Aplicar filtros</Button>
        </div>
      </div>
    </div>
  );
};

export default Filters;

