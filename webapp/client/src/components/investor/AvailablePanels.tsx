import { useEffect, useMemo, useState } from "react";
import "rc-slider/assets/index.css";
import PanelCard from "./PanelCard";
import Slider from "rc-slider";

type AvailablePanelsProps = {
  panels: any[] | undefined | null;
  user: any | undefined;
};

const AvailablePanels = ({ panels, user }: AvailablePanelsProps) => {
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [year, setYear] = useState<number | undefined>(undefined);
  const [location, setLocation] = useState<string>("");
  // Removed capacity and ROI filters per request
  const [page, setPage] = useState<number>(1);
  const PAGE_SIZE = 9;

  const getNumericPrice = (panel: any): number | undefined => {
    const raw = panel?.price;
    if (raw && typeof raw === "object" && typeof raw.$numberDecimal === "string") {
      const dec = Number(raw.$numberDecimal);
      return Number.isFinite(dec) ? dec : undefined;
    }
    const num = Number(raw);
    return Number.isFinite(num) ? num : undefined;
  };

  const getYear = (panel: any): number | undefined => {
    const value = panel?.installationYear;
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
  };

  const getLocation = (panel: any): string | undefined => {
    return (panel?.location);
  };

  // Country derived from location no longer used as separate filter

  // Region removed; not present in panel data

  // Removed unused capacity helper

  // Derive global ranges and options from available panels
  const availablePanels = useMemo(() => (panels || []).filter((p) => !p?.owner), [panels]);

  const priceRange = useMemo(() => {
    const prices = availablePanels
      .map(getNumericPrice)
      .filter((v): v is number => typeof v === "number" && Number.isFinite(v));
    if (prices.length === 0) return { min: 0, max: 0 };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [availablePanels]);

  const yearOptions = useMemo(() => {
    const years = Array.from(
      new Set(
        availablePanels
          .map(getYear)
          .filter((v): v is number => typeof v === "number" && Number.isFinite(v))
      )
    ).sort((a, b) => b - a);
    return years;
  }, [availablePanels]);

  const locationOptions = useMemo(() => {
    const locs = Array.from(
      new Set(
        availablePanels
          .map(getLocation)
          .filter((v): v is string => typeof v === "string" && v.trim() !== "")
          .map((v) => v.trim())
      )
    ).sort((a, b) => a.localeCompare(b));
    return locs;
  }, [availablePanels]);

  // Country options removed

  // Region options removed

  // Initialize price sliders when data changes
  useEffect(() => {
    if (priceRange.min !== priceRange.max) {
      setMinPrice((prev) => (prev === undefined ? priceRange.min : Math.max(priceRange.min, Math.min(prev, priceRange.max))));
      setMaxPrice((prev) => (prev === undefined ? priceRange.max : Math.min(priceRange.max, Math.max(prev, priceRange.min))));
    } else {
      setMinPrice(priceRange.min);
      setMaxPrice(priceRange.max);
    }
  }, [priceRange.min, priceRange.max]);

  useEffect(() => {
    setPage(1);
  }, [minPrice, maxPrice, year, location]);

  const filteredPanels = useMemo(() => {
    return availablePanels.filter((p) => {
      const price = getNumericPrice(p);
      if (minPrice !== undefined && (price === undefined || price < minPrice)) return false;
      if (maxPrice !== undefined && (price === undefined || price > maxPrice)) return false;

      if (year !== undefined) {
        const py = getYear(p);
        if (py !== year) return false;
      }

      if (location.trim() !== "") {
        const loc = getLocation(p);
        if (!loc || !String(loc).toLowerCase().includes(location.trim().toLowerCase())) return false;
      }

      // Country filter removed
      // Region filter removed

      return true;
    });
  }, [availablePanels, minPrice, maxPrice, year, location]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredPanels.length / PAGE_SIZE));
  }, [filteredPanels.length]);

  const currentPage = useMemo(() => {
    return Math.min(page, totalPages);
  }, [page, totalPages]);

  const paginatedPanels = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredPanels.slice(start, end);
  }, [filteredPanels, currentPage]);

  return (
    <>
      <div className="card p-3 mb-3 w-100" style={{ backgroundColor: "var(--color-bg)", border: "1px solid var(--color-green-main)" }}>
        <div className="d-flex flex-wrap align-items-end gap-4">
          <div style={{ minWidth: "300px" }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-semibold" style={{ color: "var(--color-green-main)" }}>Price range</span>
              <span>
                {minPrice ?? priceRange.min} - {maxPrice ?? priceRange.max}
              </span>
            </div>
            <div className="px-2">
              <Slider
                min={priceRange.min}
                max={priceRange.max}
                step={1}
                value={[minPrice ?? priceRange.min, maxPrice ?? priceRange.max]}
                allowCross={false}
                onChange={(vals: number[] | number) => {
                  const [minV, maxV] = Array.isArray(vals) ? vals : [priceRange.min, priceRange.max];
                  setMinPrice(minV);
                  setMaxPrice(maxV);
                }}
              />
            </div>
          </div>

          <div style={{ minWidth: "220px" }}>
            <label className="fw-semibold mb-2" style={{ color: "var(--color-green-main)" }}>Location</label>
            <select
              className="form-select select-themed"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="">All locations</option>
              {locationOptions.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div style={{ minWidth: "260px" }}>
            <label className="fw-semibold mb-2" style={{ color: "var(--color-green-main)" }}>Year</label>
            <div className="d-flex flex-wrap gap-2">
              <div className="form-check me-3">
                <input
                  className="form-check-input"
                  type="radio"
                  name="yearFilter"
                  id="year-all"
                  checked={year === undefined}
                  onChange={() => setYear(undefined)}
                />
                <label className="form-check-label" htmlFor="year-all">
                  All
                </label>
              </div>
              {yearOptions.map((y) => (
                <div key={y} className="form-check me-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="yearFilter"
                    id={`year-${y}`}
                    checked={year === y}
                    onChange={() => setYear(y)}
                  />
                  <label className="form-check-label" htmlFor={`year-${y}`}>
                    {y}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {paginatedPanels.length > 0 ? (
          paginatedPanels.map((panel) => (
            <div key={panel._id} className="col-md-6 col-lg-4 mb-3">
              <PanelCard solarPanel={panel} user={user!} canBuy={user?.authImages?.validated} />
            </div>
          ))
        ) : (
          <div className="col-md-12 text-center">
            <p>No available panels for investment.</p>
          </div>
        )}
      </div>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <div>
          Showing {(filteredPanels.length === 0) ? 0 : ((currentPage - 1) * PAGE_SIZE + 1)} - {Math.min(currentPage * PAGE_SIZE, filteredPanels.length)} of {filteredPanels.length}
        </div>
        <nav>
          <nav aria-label="Page navigation">
            <ul className="pagination pagination-themed justify-content-center mb-0">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Previous">
                  <span aria-hidden="true">&laquo;</span>
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <li key={p} className={`page-item ${p === currentPage ? "active" : ""}`}>
                  <button className="page-link" onClick={() => setPage(p)}>{p}</button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} aria-label="Next">
                  <span aria-hidden="true">&raquo;</span>
                </button>
              </li>
            </ul>
          </nav>
        </nav>
      </div>
    </>
  );
};

export default AvailablePanels;


