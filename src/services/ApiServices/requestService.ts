import axios from "axios";
import { BASE_URL } from "@/constants/api";

const ngrokSkipWarning = { headers: { "bypass-tunnel-reminder": "true" } };

export async function getAllRequests(id?:number) {
    const response = await axios.get(`${BASE_URL}/api/requests${id?"?applicantId="+id:""}`, ngrokSkipWarning);
    return response.data;
}

export async function getRequestById(id: number) {
    const response = await axios.get(`${BASE_URL}/api/requests/${id}`, ngrokSkipWarning);
    return response.data;
}

export async function createRequest(requestData: any) {
    const response = await axios.post(`${BASE_URL}/api/requests`, requestData, ngrokSkipWarning);
    return response.data;
}

export async function updateRequest(id: number, requestData: any) {
    const response = await axios.put(`${BASE_URL}/api/requests/${id}`, requestData, ngrokSkipWarning);
    return response.data;
}

export async function deleteRequest(id: number) {
    const response = await axios.delete(`${BASE_URL}/api/requests/${id}`, ngrokSkipWarning);
    return response.data;
}

export async function getRequestsByService(serviceId: number) {
    const response = await axios.get(`${BASE_URL}/api/requests/get-by-service/${serviceId}`, ngrokSkipWarning);
    return response.data;
}

export async function getRequestWithApplicantAndRequestDetails(requestId: number) {
    const response = await axios.get(`${BASE_URL}/api/requests/with-applicant-and-request-details/${requestId}`, ngrokSkipWarning);
    return response.data;
}

export async function checkUserRequest(serviceId: number, applicantId: number) {
    const response = await axios.get(`${BASE_URL}/api/requests/check-applicant-requests`, {
        params: {
            serviceId,
            applicantId
        },
        ...ngrokSkipWarning
    });
    return response.data;
}

export async function cancelRequest(requestId: number) {
    const response = await axios.delete(`${BASE_URL}/api/requests/cancel-request/${requestId}`, ngrokSkipWarning);
    return response.data;
}

export async function updateFinishRequest(id: number) {
    const response = await axios.put(`${BASE_URL}/api/requests/finish-request/${id}`, null, ngrokSkipWarning);
    return response.data;
}

export async function getRequestsByApplicantId(applicantId: number) {
    const response = await axios.get(`${BASE_URL}/api/requests?ApplicantId=${applicantId}`, ngrokSkipWarning);
    return response.data;
}
