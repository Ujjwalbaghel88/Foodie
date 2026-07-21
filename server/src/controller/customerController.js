import Customer from "../model/customerModel.js";

export const createCustomer = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let customerData = req.body;

    // Parse nested JSON strings if they exist
    if (typeof customerData.geolocation === 'string') {
      customerData.geolocation = JSON.parse(customerData.geolocation);
    }

    // Check if customer profile already exists
    const existingCustomer = await Customer.findOne({ userId });
    if (existingCustomer) {
      const error = new Error("Customer profile already exists for this user");
      error.status = 400;
      return next(error);
    }

    // Create new customer
    const newCustomer = new Customer({
      userId,
      addressBook: customerData.addressBook || [],
      isProfileComplete: true,
    });

    await newCustomer.save();
    res.status(201).json({
      message: "Customer profile created successfully",
      data: newCustomer,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerByUserId = async (req, res, next) => {
  try {
    const userId = req.user._id;

    let customer = await Customer.findOne({ userId });
    
    // Auto-create customer profile if it doesn't exist
    if (!customer) {
      customer = new Customer({
        userId,
        addressBook: [],
        isProfileComplete: false,
      });
      await customer.save();
    }

    res.status(200).json({
      message: "Customer data retrieved successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let updates = req.body;

    // Parse nested JSON strings if they exist
    if (typeof updates.geolocation === 'string') {
      try {
        updates.geolocation = JSON.parse(updates.geolocation);
      } catch (parseError) {
        console.error("Error parsing geolocation:", parseError);
      }
    }
    
    // Ensure geolocation has proper lat/lng values as numbers
    if (updates.geolocation) {
      updates.geolocation = {
        lat: parseFloat(updates.geolocation.lat),
        lng: parseFloat(updates.geolocation.lng),
      };
    }

    const customer = await Customer.findOneAndUpdate({ userId }, updates, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!customer) {
      const error = new Error("Customer profile not found");
      error.status = 404;
      return next(error);
    }

    res.status(200).json({
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

export const addAddress = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { ReceiverName, ReceiverPhone, address, city, state, zipCode, country, lat, lng } = req.body;

    let customer = await Customer.findOne({ userId });
    
    // Auto-create customer profile if it doesn't exist
    if (!customer) {
      customer = new Customer({
        userId,
        addressBook: [],
        isProfileComplete: false,
      });
    }

    customer.addressBook.push({
      ReceiverName,
      ReceiverPhone,
      address,
      city,
      state,
      zipCode,
      country,
      geolocation: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
    });

    await customer.save();
    res.status(201).json({
      message: "Address added successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { addressId } = req.params;
    const { ReceiverName, ReceiverPhone, address, city, state, zipCode, country, lat, lng } = req.body;

    const customer = await Customer.findOne({ userId });
    if (!customer) {
      const error = new Error("Customer profile not found");
      error.status = 404;
      return next(error);
    }

    const addressIndex = customer.addressBook.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      const error = new Error("Address not found");
      error.status = 404;
      return next(error);
    }

    customer.addressBook[addressIndex] = {
      _id: customer.addressBook[addressIndex]._id,
      ReceiverName,
      ReceiverPhone,
      address,
      city,
      state,
      zipCode,
      country,
      geolocation: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
    };

    await customer.save();
    res.status(200).json({
      message: "Address updated successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { addressId } = req.params;

    const customer = await Customer.findOne({ userId });
    if (!customer) {
      const error = new Error("Customer profile not found");
      error.status = 404;
      return next(error);
    }

    customer.addressBook = customer.addressBook.filter(
      (addr) => addr._id.toString() !== addressId
    );

    await customer.save();
    res.status(200).json({
      message: "Address deleted successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};
