import { getYearsToPresent } from "@/lib/dateUtils";
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { addApplicantExperience } from "@/services/ApiServices/applicantProfileService";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { notification } from "antd";
import { ApplicantExperience } from "../../../types/Applicant";

const AddExperienceDialog = (props: any) => {
  const { open, setOpen, setRefresh } = props;

  const user = useSelector((state: RootState) => state.token.user);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [experience, setExperience] = useState<ApplicantExperience>({
    id: 0,
    name: "",
    fromYear: 0,
    toYear: 0,
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setExperience((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    setIsProcessing(true);
    try {
      const payload = {
        name: experience.name,
        fromYear: experience.fromYear,
        toYear: experience.toYear,
        description: experience.description,
      };
      console.log(payload);
      await addApplicantExperience(Number(user?.id), payload);
      notification.success({
        message: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.log(error);
    } finally {
      setOpen(false);
      setIsProcessing(false);
      setRefresh(true);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-50 z-50" />
        <Dialog.Content className="fixed z-50 flex justify-center items-center inset-0 bg-white p-6 rounded-md shadow-lg max-w-[800px] w-[90%] h-auto max-h-[90vh] overflow-y-auto mx-auto my-auto self-start">
          <div className="relative w-full h-full max-h-[90vh]">
            <div className="absolute top-0 right-0 p-4">
              <Dialog.Close
                onClick={() => setOpen(false)}
                className="text-xl font-bold cursor-pointer hover:text-gray-500"
              >
                &times;
              </Dialog.Close>
            </div>

            <div className="flex flex-col justify-between h-full">
              <div>
                <Dialog.Title className="text-2xl font-bold">
                  Add Experience Information
                </Dialog.Title>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    What experience do you have?
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={experience.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md"
                    placeholder="Enter your experience"
                  />
                </div>

                <div className="mt-4 flex space-x-4">
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700">
                      Start Date
                    </label>
                    <select
                      name="fromYear"
                      value={experience.fromYear || 0}
                      onChange={handleChange}
                      className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md"
                    >
                      <option value="" disabled>
                        Select Year
                      </option>
                      {getYearsToPresent(1973).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700">
                      End Date
                    </label>
                    <select
                      name="toYear"
                      value={experience.toYear || 0}
                      onChange={handleChange}
                      className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md"
                    >
                      <option value="" disabled>
                        Select Year
                      </option>
                      {getYearsToPresent(1973).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={experience.description || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md"
                    rows={4}
                    placeholder="Provide brief description for your experience"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-between space-x-4">
                <button
                  onClick={handleSaveChanges}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  {isProcessing ? "Processing..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AddExperienceDialog;
