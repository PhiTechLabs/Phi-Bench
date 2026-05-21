export const getCurrentUser = () => {

    try {

        return JSON.parse(localStorage.getItem("user"));

    } catch (error) {

        return null;

    }

};