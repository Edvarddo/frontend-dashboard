// src/components/Filters.jsx
import MultiSelect from "./MultiSelect";
import DatePicker from "./DatePicker";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const Filters = ({
  clearValues,
  categorias,
  situaciones,
  departamentos,
  juntasVecinales,
  setFiltrosObj,
  filtrosObj,
  dateRange,
  setDateRange,
  setIsValid,
  isValid,
  loading,
  handleDownload,
  limpiarFiltros,
  aplicarFiltros,
  showDownload,
  isDownloadAvailable,
  // 🔹 nuevo: controla el layout
  variant = "default", // "default" (dashboard) | "sidebar"
}) => {
  const isSidebar = variant === "sidebar";

  // ---- clases dependiendo del modo ----
  const containerClasses = isSidebar
    ? "bg-white p-3 rounded-xl border border-slate-200"
    : "bg-white p-6 rounded-lg shadow-md";

  const gridClasses = isSidebar
    ? "grid grid-cols-1 gap-3 mb-4"
    : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6";

  const headingClasses = isSidebar
    ? "mb-1 text-xs font-semibold text-slate-700"
    : "mb-2 font-semibold";

  const buttonsWrapperClasses = isSidebar
    ? "flex flex-col gap-2 mt-1"
    : "flex justify-between flex-wrap mb-6 btn-section p-1";

  const downloadBtnClasses = isSidebar
    ? "w-full justify-center"
    : "mb-3 bg-blue-500 hover:bg-blue-600 filter-btn w-full md:w-[unset]";

  const actionsContainerClasses = isSidebar
    ? "w-full flex flex-col md:flex-row gap-2"
    : "filter-btn-cont w-full md:w-[unset]";

  const limpiarBtnClasses = isSidebar
    ? "w-full md:w-auto text-sm"
    : "w-full mb-2 mr-2 md:w-[unset] filter-btn";

  const aplicarBtnClasses = isSidebar
    ? "w-full md:w-auto bg-green-500 hover:bg-green-600 text-white text-sm"
    : "w-full md:w-[unset] bg-green-500 hover:bg-green-600 text-white filter-btn";

  return (
    <div className={containerClasses}>
      <div className={gridClasses}>
        <div>
          <h2 className={headingClasses}>Categoría</h2>
          <MultiSelect
            clearValues={clearValues}
            options={categorias}
            onValueChange={(val) => {
              setFiltrosObj({ ...filtrosObj, categoria: val });
            }}
          />
        </div>

        <div>
          <h2 className={headingClasses}>Estado de la publicación</h2>
          <MultiSelect
            clearValues={clearValues}
            options={situaciones}
            onValueChange={(val) => {
              setFiltrosObj({ ...filtrosObj, situacion: val });
            }}
          />
        </div>

        <div>
          <h2 className={headingClasses}>Rango de fechas</h2>
          <DatePicker
            dateRange={dateRange}
            setDateRange={setDateRange}
            setIsValid={setIsValid}
          />
        </div>

        <div>
          <h2 className={headingClasses}>Junta vecinal</h2>
          <MultiSelect
            clearValues={clearValues}
            options={juntasVecinales}
            onValueChange={(val) => {
              setFiltrosObj({ ...filtrosObj, junta: val });
            }}
          />
        </div>

        <div>
          <h2 className={headingClasses}>Departamento</h2>
          <MultiSelect
            clearValues={clearValues}
            options={departamentos}
            onValueChange={(val) => {
              setFiltrosObj({ ...filtrosObj, departamentos: val });
            }}
          />
        </div>
      </div>

      <div className={buttonsWrapperClasses}>
        {showDownload && (
          <Button
            disabled={loading || !isDownloadAvailable}
            variant="outline"
            onClick={handleDownload}
            className={downloadBtnClasses}
          >
            <span className="flex items-center">
              <Download className="mr-2 h-4 w-4" />
              Descargar datos
            </span>
          </Button>
        )}

        <div className={actionsContainerClasses}>
          <Button
            onClick={limpiarFiltros}
            className={limpiarBtnClasses}
            variant="outline"
          >
            Limpiar filtros
          </Button>
          <Button
            disabled={isValid}
            onClick={aplicarFiltros}
            className={aplicarBtnClasses}
          >
            Aplicar filtros
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Filters;
