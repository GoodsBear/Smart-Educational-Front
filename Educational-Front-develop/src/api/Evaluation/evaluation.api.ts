import request from "@/utils/request";

const EVALUATION_BASE_URL = "/api/app/evaluation";

const EvaluationAPI = {
  getEvaluationList() {
    return request({
      url: `${EVALUATION_BASE_URL}/show-evaluation`,
      method: "get",
    });
  },
};

export default EvaluationAPI;
