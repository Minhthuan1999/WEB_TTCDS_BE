const App = require("../models/appModel");

class AppController {
    
  async getStatistic(req, res) {
    try {
      const app = await App.getStatistic();
      res.json(app);
    } catch (error) {
      console.error("Lỗi: ", error);
      res.status(500).json({ message: "Có lỗi xảy ra" });
    }
  }


  async getTotalVisitor(req, res) {
    try {
      const app = await App.getTotalVisitor();
      res.json(app)
    } catch (error) {
      console.error("Lỗi: ", error);
      res.status(500).json({ message: "Có lỗi xảy ra" });
    }
  }

  async updateVisits(req, res) {
    try {
      const query = await App.updateVisitor();
      res.json({ message: 'Visit count updated successfully' })
    } catch (error) {
      res.status(500).json({ message: 'Error updating visit count', error: error.message });
    }
  }

  async updatePageViews(req, res) {
    try {
      const query = await App.updatePageviews();
      res.json({ message: 'Pageview count updated successfully' })
    } catch (error) {
      res.status(500).json({ message: 'Error updating pageview', error: error.message });
    }
  }
  
}

module.exports = new AppController();
