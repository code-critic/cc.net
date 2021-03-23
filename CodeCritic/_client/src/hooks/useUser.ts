import { useEffect, useState } from "react"
import { appDispatcher, getUser } from "../init"

const Role = {
    root: 'root',
    student: 'student',
}

export const useUser = () => {
    const [user, setUser] = useState(getUser())

    const isRoot = user.role === Role.root;
    const isStudent = user.role === Role.student;
    const canBeRoot = user.roles.includes(Role.root);
    const canBeStudent = user.roles.includes(Role.student);

    useEffect(() => {
        appDispatcher.register(payload => {
          switch (payload.actionType) {
            case "userChanged":
              setUser({ ...getUser() });
              break;
          }
        });
      }, []);

    // const { user, isRoot, isStudent, canBeRoot, canBeStudent } = useUser();
    return { user, isRoot, isStudent, canBeRoot, canBeStudent };
}