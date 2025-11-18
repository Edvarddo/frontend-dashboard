import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function AccordionList({ section, selectedSection, onSelect }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isAnyChildActive = section.children?.some(
    (item) => item.link === location.pathname || selectedSection === item.title
  );

  const toggle = () => setOpen((prev) => !prev);

  return (
    <div className="w-full">
      {/* Botón principal del grupo (usa tu fondo oscuro del li padre) */}
      <button
        type="button"
        onClick={toggle}
        className="flex items-center justify-between w-full gap-2"
      >
        <span className="flex items-center gap-2">
          {section.icon}
          <span className="text-sm">{section.title}</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Submenú hacia abajo */}
      <div
        className={`
          overflow-hidden transition-[max-height,opacity] duration-300 ease-out
          ${open ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <ul className="mt-2 ml-4 space-y-1 border-l border-slate-200">
          {section.children.map((item) => {
            const isActive =
              item.link === location.pathname || selectedSection === item.title;

            return (
              <li key={item.link}>
                <Link
                  to={item.link}
                  onClick={() => onSelect(item.title)}
                  className={`
                    flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg
                    ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-800 hover:bg-slate-50"
                    }
                  `}
                >
                  <span className="text-slate-400">{item.icon}</span>
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
export { AccordionList };