import { useEffect, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { AiOutlineLock, AiOutlineUser } from "react-icons/ai";
import AccountSection from "./components/AccountSection";
import AuthSection from "./components/AuthSection";
import { useDispatch, useSelector } from "react-redux";
import { FaClipboardList } from "react-icons/fa";
import { RootState } from "@/store/store";
import { uploadFile } from "@/services/ApiServices/fileUploadService";
import Spinner from "@/components/Spinner";
import {
  getProviderProfile,
  updateProviderProfile,
} from "@/services/ApiServices/providerService";
import { setUser } from "@/reducers/tokenSlice";
import ServicesSection from "./components/ServicesSection";

const ProviderProfile = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.token.user);

  const [documents, setDocuments] = useState<File[]>([]);
  const [avatar, setAvatar] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState("account");
  const [isEditing, setIsEditing] = useState(false);
  const [_error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isProfileUpdated, setIsProfileUpdated] = useState<boolean>(false);
  const [providerData, setProviderData] = useState({
    username: "john_doe",
    email: "johndoe@example.com",
    phone: "+1234567890",
    address: "1234 Main St, Springfield",
    avatar: "https://via.placeholder.com/150",
    organizationName: "Tech Providers Inc.",
    contactPersonName: "Jane Smith",
    status: "Active", // Possible values: Active, Pending, Suspended
    subscriptionName: "Basic",
    providerDocuments: [
      {
        name: "Organization Registration",
        type: "Organization Registration",
        fileUrl:
          "https://res.cloudinary.com/djiztef3a/raw/upload/v1732419389/jh9olwxn5fir9zrmklli.pdf",
      },
      {
        name: "Tax Certificate",
        type: "Tax Certificate",
        fileUrl:
          "https://res.cloudinary.com/djiztef3a/raw/upload/v1732419389/jh9olwxn5fir9zrmklli.pdf",
      },
    ],
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getProviderProfile(Number(user?.id));
        setProviderData(response.data);
      } catch (error) {
        setError("Failed to get profile details");
        console.log(error);
      } finally {
        setIsLoading(false);
        setIsProfileUpdated(false);
      }
    };

    fetchProfile();
  }, [user?.id, isProfileUpdated]);

  // Function to get badge styles based on account status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSaveClick = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsEditing(false);
    setIsLoading(true);
    try {
      const uploadAvatarResponse = await uploadFile(avatar);
      const avatarUrls = uploadAvatarResponse.data;
      setProviderData({ ...providerData, avatar: avatarUrls[0] });

      const uploadDocumentsResponse = await uploadFile(documents);
      const documentUrls = uploadDocumentsResponse.data;
      const updatedDocuments = providerData.providerDocuments.map(
        (document, index) => ({
          ...document, // Spread the existing properties of the document
          fileUrl: documentUrls[index] || document.fileUrl, // Update the fileUrl with the new URL (preserving existing if undefined)
        })
      );

      const postData = {
        avatar: avatarUrls[0] || providerData.avatar,
        username: providerData.username,
        phone: providerData.phone,
        address: providerData.address,
        status: providerData.status,
        organizationName: providerData.organizationName,
        contactPersonName: providerData.contactPersonName,
        subscriptionName: providerData.subscriptionName,
        providerDocuments: updatedDocuments,
      };
      console.log("Post data", postData);

      await updateProviderProfile(Number(user?.id), postData);
      dispatch(setUser({ ...user, avatar: providerData.avatar }));
      setIsProfileUpdated(true);
    } catch (error) {
      setError("Update profile failed");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar([file]);
      setProviderData((prev) => ({
        ...prev,
        avatar: URL.createObjectURL(file),
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProviderData({ ...providerData, [name]: value });

    console.log(providerData);
  };

  const handleAddField = () => {
    setProviderData((prev) => ({
      ...prev,
      providerDocuments: [
        ...prev.providerDocuments,
        { name: "", type: "", fileUrl: "" },
      ],
    }));
  };

  // Remove a field from the list
  const handleRemoveField = (index: number) => {
    setProviderData((prev) => ({
      ...prev,
      providerDocuments: prev.providerDocuments.filter((_, i) => i !== index),
    }));
  };

  // Handle changes for individual fields in the list
  const handleListChange = (index: number, field: string, value: string) => {
    const updatedDocuments = [...providerData.providerDocuments] as any;
    updatedDocuments[index][field] = value;
    setProviderData({
      ...providerData,
      providerDocuments: updatedDocuments,
    });
  };

  // Handle file upload for a specific document
  const handleDocumentChange = (index: number, file: File) => {
    setDocuments((prev) => {
      const updatedDocuments = [...prev];
      updatedDocuments[index] = file;
      return updatedDocuments;
    });

    const updatedProviderDocuments = [...providerData.providerDocuments];
    updatedProviderDocuments[index].fileUrl = URL.createObjectURL(file);
    setProviderData({
      ...providerData,
      providerDocuments: updatedProviderDocuments,
    });
  };

  if (isLoading) {
    return <Spinner size="large" />;
  }

  return (
    <div className="w-full mx-auto rounded-lg">
      <Tabs.Root
        defaultValue={activeTab}
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-row w-full"
        orientation="vertical"
      >
        <Tabs.List
          aria-label="Provider Profile Tabs"
          className="flex flex-col w-full md:w-1/6 p-6 border-r md:border-r border-gray-400 space-y-4 pr-2 md:space-y-4 md:pr-4"
        >
          <div className="text-xl font-semibold text-gray-800">
            Account Settings
          </div>
          <Tabs.Trigger
            value="account"
            className="flex items-center gap-2 text-gray-700 hover:text-[#1eb2a6] focus:outline-none data-[state=active]:text-[#1eb2a6] data-[state=active]:font-bold"
          >
            <AiOutlineUser className="text-lg" />
            Profile
          </Tabs.Trigger>

          <Tabs.Trigger
            value="service"
            className="flex items-center gap-2 text-gray-700 hover:text-[#1eb2a6] focus:outline-none data-[state=active]:text-[#1eb2a6] data-[state=active]:font-bold"
          >
            <FaClipboardList className="text-lg" />
            Services
          </Tabs.Trigger>

          <Tabs.Trigger
            value="password"
            className="flex items-center gap-2 text-gray-700 hover:text-[#1eb2a6] focus:outline-none data-[state=active]:text-[#1eb2a6] data-[state=active]:font-bold"
          >
            <AiOutlineLock className="text-lg" />
            Authentication
          </Tabs.Trigger>
        </Tabs.List>

        <div className="w-full md:w-5/6 p-6">
          <AccountSection
            getStatusBadge={getStatusBadge}
            providerData={providerData}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            handleSaveClick={handleSaveClick}
            handleAvatarChange={handleAvatarChange}
            handleDocumentChange={handleDocumentChange}
            handleInputChange={handleInputChange}
            handleAddField={handleAddField}
            handleRemoveField={handleRemoveField}
            handleListChange={handleListChange}
            previewUrl={previewUrl}
            setPreviewUrl={setPreviewUrl}
          />
          <AuthSection />
          <ServicesSection></ServicesSection>
        </div>
      </Tabs.Root>
    </div>
  );
};

export default ProviderProfile;
