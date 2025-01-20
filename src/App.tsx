import { useState } from "react";

function App() {
  return <YeCalendar />;
}

interface ICalendarType {
  defaultValue?: Date;
  onChange?: (date: Date) => void;
}

const monthName = [
  "一",
  "二",
  "三",
  "四",
  "五",
  "六",
  "七",
  "八",
  "九",
  "十",
  "十一",
  "十二",
];

const daysOfTheWeek: string[] = ["日", "一", "二", "三", "四", "五", "六"];

// 一个月有多少天
const daysOfMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};
// 这个月 1 号是星期几?
const firstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

// * -----------
const YeCalendar: React.FC<ICalendarType> = (props) => {
  const { defaultValue, onChange } = props;
  const [date, setDate] = useState(defaultValue || new Date());

  // 处理点击上个月和下个月的按扭点击事件
  const handlePrevMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
  };

  // 只渲染上个月的日期
  const renderPreviousDates = (days: JSX.Element[]) => {
    const firstDay = firstDayOfMonth(date.getFullYear(), date.getMonth());

    for (let i = firstDay - 1; i >= 0; i--) {
      // 获取上个月最后几天
      const currentDate = new Date(date.getFullYear(), date.getMonth(), -i);
      days.push(
        <div
          key={`before-month-${i}`}
          className="duration200 w-[calc(100%/7)] cursor-pointer rounded-lg text-center font-sans font-light leading-[30px] text-gray-300 hover:bg-slate-200"
        >
          {currentDate.getDate()}
        </div>
      );
    }
  };
  // 只渲染本月的日期
  const renderCurrentDates = (days: JSX.Element[]) => {
    const daysCount = daysOfMonth(date.getFullYear(), date.getMonth());

    for (let i = 1; i <= daysCount; i++) {
      const clickHandler = () => {
        const currentDate = new Date(date.getFullYear(), date.getMonth(), i);
        setDate(currentDate);
        onChange?.(currentDate);
      };

      // 选中时添加背景
      if (i === date.getDate()) {
        days.push(
          <div
            key={i}
            className="w-[calc(100%/7)] cursor-pointer rounded-lg bg-black text-center font-sans leading-[30px] text-white"
            onClick={() => clickHandler()}
          >
            {i}
          </div>
        );
      } else {
        days.push(
          <div
            key={i}
            className="w-[calc(100%/7)] cursor-pointer rounded-lg text-center font-sans font-light leading-[30px] text-gray-700 duration-200 hover:bg-slate-200"
            onClick={() => clickHandler()}
          >
            {i}
          </div>
        );
      }
    }
  };
  // 渲染下一个月的日期
  const renderNextDates = (days: JSX.Element[]) => {
    // 动态渲染到底是35 还是 42 ? 获取下个月是星期几开始? 如果是星期日开始说明日历填满了
    const nextDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);

    if (nextDate.getDay() !== 0) {
      // 获取上个月最后几天
      for (let i = 1; i <= 7 - nextDate.getDay(); i++) {
        days.push(
          <div
            key={`next-month-${i}`}
            className="w-[calc(100%/7)] cursor-pointer rounded-lg text-center font-sans font-light leading-[30px] text-gray-300 duration-200 hover:bg-slate-200"
          >
            {i}
          </div>
        );
      }
    }
  };

  //* 渲染组件的函数
  const renderDates = () => {
    const days: JSX.Element[] = [];

    renderPreviousDates(days);
    renderCurrentDates(days);
    renderNextDates(days);

    return days;
  };

  const renderDaysOfTheWeek = () => {
    return daysOfTheWeek.map((day, index) => {
      return (
        <div
          className="w-[calc(100%/7)] text-center font-light leading-[30px] text-gray-500"
          key={`day-${index}`}
        >
          {day}
        </div>
      );
    });
  };

  return (
    <div className="m-auto h-fit w-[270px] items-center justify-center rounded-lg bg-white/95 p-3 shadow-lg">
      <div className="flex h-10 items-center justify-center gap-4">
        <button
          onClick={handlePrevMonth}
          className="rounded-lg border px-2 font-serif text-lg"
        >
          &lt;
        </button>
        <div className="mx-4 w-32 text-center">
          {date.getFullYear()} 年 {monthName[date.getMonth()]} 月
        </div>
        <button
          onClick={handleNextMonth}
          className="rounded-lg border px-2 font-serif text-lg"
        >
          &gt;
        </button>
      </div>
      <div className="flex flex-wrap gap-y-1">
        {/* 渲染顶部 7 天 */}
        {renderDaysOfTheWeek()}
        {/* 渲染一个一个日期 */}
        {renderDates()}
      </div>
    </div>
  );
};

export default App;
