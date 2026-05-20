export default function FilterBar() {
  return (
    <div className="border-b-[0px] border-line-light bg-white" id="filterBar">
      <div className="mx-auto w-full max-w-[95vw] px-6 py-5 md:px-[60px]">
        <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-[800] uppercase tracking-[0.12em] text-content-subtle">
              Show
            </span>
            <button className="filter-chip active" data-filter="level" data-value="all" type="button">
              All Courses
            </button>
            <button className="filter-chip" data-filter="level" data-value="beginner" type="button">
              Beginner
            </button>
            <button className="filter-chip" data-filter="level" data-value="intermediate" type="button">
              Intermediate
            </button>
            <button className="filter-chip" data-filter="level" data-value="advanced" type="button">
              Advanced
            </button>
            <button className="filter-chip" data-filter="level" data-value="flexible" type="button">
              Flexible / All
            </button>
          </div>

          {/* <div className="h-[5px] w-[1px] bg-line-light md:block md:h-6 md:w-px" /> */}

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-[800] uppercase tracking-[0.12em] text-content-subtle">
              Age
            </span>
            <button className="filter-chip active" data-filter="age" data-value="all" type="button">
              All Ages
            </button>
            <button className="filter-chip" data-filter="age" data-value="young" type="button">
              Ages 5–8
            </button>
            <button className="filter-chip" data-filter="age" data-value="mid" type="button">
              Ages 8–12
            </button>
            <button className="filter-chip" data-filter="age" data-value="teen" type="button">
              Ages 12+
            </button>
          </div>

          <div className="text-[13px] font-[plus-b] text-content-muted">
            <span id="courseCount">6</span> courses
          </div>
        </div>
      </div>
    </div>
  );
}

