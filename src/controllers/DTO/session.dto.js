class SessionDTO {
    constructor(session) {
        this._id = session.user._id;
        this.email = session.user.email;
        this.firstName = session.user.first_name;
        this.lastName = session.user.last_name;
        this.birth = session.user.birth;
        this.phone = session.user.phone;
        this.rank = session.user.rank;
        this.status = session.user.role;
        this.ci = session.user.ci;
        this.address = session.user.address;
        this.preferences = session.user.preferences;
        this.statistics = session.user.statistics;
        this.settings = session.user.settings;
        this.purchasedCourses = session.user.purchasedCourses;
        this.finishedCourses = session.user.finishedCourses
    }
}

export default SessionDTO;