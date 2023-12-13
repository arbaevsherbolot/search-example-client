import instance from "../core/axios";

export const search = async (query: string, count?: number) => {
  try {
    return (
      await instance.get(
        count
          ? `/search?query=${query}&count=${count}`
          : `/search?query=${query}`
      )
    ).data;
  } catch (e: any) {
    throw {
      msg: `${e.response.data.error}. ${e.response.data.message}`,
    };
  }
};
