export const auth = () => {
    return new Promise((resolve, reject) => {
        if ((window as any).currentUser) {
            resolve((window as any).currentUser);
        }

        fetch("home/whoami")
            .then(response => {
                if (response.ok) {
                    response
                        .json()
                        .then(data => {
                            (window as any).currentUser = data;
                            resolve((window as any).currentUser);
                        })
                } else {
                    console.log('auth error', (window as any).currentUser);
                    debugger;
                    (window as any).location.href = "https://flowdb.nti.tul.cz/auth/";
                    reject();
                }
            })
    });
}
