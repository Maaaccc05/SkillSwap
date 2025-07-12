import { useForm, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import { addHours } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";

export default function ScheduleSwap() {
  const { handleSubmit, control, register, watch } = useForm({
    defaultValues: {
      date: new Date(),
      start: new Date(),
      duration: 60,
      meetingType: "video",
      location: "",
    },
  });

  const navigate = useNavigate();
  const { swapId } = useParams();

  const onSubmit = async (data) => {
    console.log("schedule payload", data);
    if (data.meetingType === "video") {
      navigate(`/room/demo-room-id`); // Replace with dynamic roomId if needed
    } else {
      alert("Your in-person swap has been scheduled!");
      navigate("/requests");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-50 via-indigo-100 to-white p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-xl bg-white rounded-xl shadow-2xl p-8 space-y-6 border border-indigo-100"
      >
        <h1 className="text-2xl font-bold text-slate-800 text-center">
          Schedule Your Skill Swap
        </h1>
        <p className="text-sm text-slate-500 text-center">Swap ID: {swapId}</p>

        {/* Date Picker */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Pick a date</label>
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                selected={field.value}
                onChange={field.onChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm"
                dateFormat="PPP"
              />
            )}
          />
        </div>

        {/* Time Picker */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Start time</label>
          <Controller
            name="start"
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                selected={field.value}
                onChange={field.onChange}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="p"
                className="w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm"
              />
            )}
          />
        </div>

        {/* Duration Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Duration (in minutes)</label>
          <input
            {...register("duration", { valueAsNumber: true })}
            type="number"
            min={15}
            max={180}
            step={15}
            className="w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm"
          />
        </div>

        {/* Meeting Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Meeting type</label>
          <select
            {...register("meetingType")}
            className="w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm"
          >
            <option value="video">Video call (recommended)</option>
            <option value="in-person">In-person / Other</option>
          </select>
        </div>

        {/* Location or Note (if not video) */}
        {watch("meetingType") !== "video" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Location or Note</label>
            <input
              {...register("location")}
              placeholder="E.g., Zoom link or Coffee shop address"
              className="w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm"
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-md transition"
        >
          Confirm & Schedule
        </button>
      </form>
    </div>
  );
}
