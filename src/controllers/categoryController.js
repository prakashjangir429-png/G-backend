import mongoose from "mongoose";
import Category from "../NewsModals/Category.js";

export const createCategory = async (req, res) => {
  try {
    const {
      name,
      hiName,
      slug,
      hiSlug,
      description,
      hiDescription,
      icon,
      color,
      isNavbar,
      hasDropdown,
      isActive,
      order,
    } = req.body;

    // Required fields
    if (!name || !slug || !hiSlug) {
      return res.status(400).json({
        success: false,
        message: "Name, slug and hiSlug are required",
      });
    }

    // Check duplicate name/slug/hiSlug
    const existingCategory = await Category.findOne({
      $or: [
        { name: name.trim() },
        { slug: slug.toLowerCase().trim() },
        { hiSlug: hiSlug.toLowerCase().trim() },
      ],
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Category with this name, slug or Hindi slug already exists",
      });
    }

    const category = await Category.create({
      name: name.trim(),
      hiName,
      slug: slug.toLowerCase().trim(),
      hiSlug: hiSlug.toLowerCase().trim(),
      description,
      hiDescription,
      icon,
      color,
      isNavbar,
      hasDropdown,
      isActive,
      order,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("Create Category Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
        field: Object.keys(error.keyPattern || {})[0],
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: error.message,
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search,
      name,
      hiName,
      slug,
      hiSlug,
      isActive,
      isNavbar,
      hasDropdown,
      color,
      icon,
      minOrder,
      maxOrder,
      sortBy = "order",
      sortOrder = "asc",
    } = req.query;

    page = Math.max(parseInt(page) || 1, 1);
    limit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);

    const skip = (page - 1) * limit;

    const filter = {};

    // Search multiple fields
    if (search?.trim()) {
      const searchRegex = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );

      filter.$or = [
        { name: searchRegex },
        { hiName: searchRegex },
        { slug: searchRegex },
        { hiSlug: searchRegex },
        { description: searchRegex },
        { hiDescription: searchRegex },
      ];
    }

    // Individual filters
    if (name) {
      filter.name = new RegExp(
        name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );
    }

    if (hiName) {
      filter.hiName = new RegExp(
        hiName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );
    }

    if (slug) {
      filter.slug = slug.toLowerCase().trim();
    }

    if (hiSlug) {
      filter.hiSlug = hiSlug.toLowerCase().trim();
    }

    if (color) {
      filter.color = color;
    }

    if (icon) {
      filter.icon = icon;
    }

    // Boolean filters
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    if (isNavbar !== undefined) {
      filter.isNavbar = isNavbar === "true";
    }

    if (hasDropdown !== undefined) {
      filter.hasDropdown = hasDropdown === "true";
    }

    // Order range
    if (minOrder !== undefined || maxOrder !== undefined) {
      filter.order = {};

      if (minOrder !== undefined) {
        filter.order.$gte = Number(minOrder);
      }

      if (maxOrder !== undefined) {
        filter.order.$lte = Number(maxOrder);
      }
    }

    // Allowed sorting fields
    const allowedSortFields = [
      "name",
      "hiName",
      "slug",
      "hiSlug",
      "order",
      "createdAt",
      "updatedAt",
      "isActive",
      "isNavbar",
    ];

    if (!allowedSortFields.includes(sortBy)) {
      sortBy = "order";
    }

    const sortDirection =
      sortOrder === "desc" || sortOrder === "-1" ? -1 : 1;

    const sort = {
      [sortBy]: sortDirection,
      _id: 1,
    };

    const [categories, total] = await Promise.all([
      Category.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),

      Category.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,

      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      },

      filters: {
        search: search || null,
        isActive:
          isActive !== undefined ? isActive === "true" : null,
        isNavbar:
          isNavbar !== undefined ? isNavbar === "true" : null,
        hasDropdown:
          hasDropdown !== undefined ? hasDropdown === "true" : null,
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    console.error("Get Categories Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await Category.findById(id).lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Get Category By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch category",
      error: error.message,
    });
  }
};

export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Slug is required",
      });
    }

    const normalizedSlug = decodeURIComponent(slug)
      .toLowerCase()
      .trim();

    const category = await Category.findOne({
      $or: [
        { slug: normalizedSlug },
        { hiSlug: normalizedSlug },
      ],
    }).lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Get Category By Slug Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch category",
      error: error.message,
    });
  }
};


export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const {
      name,
      hiName,
      slug,
      hiSlug,
      description,
      hiDescription,
      icon,
      color,
      isNavbar,
      hasDropdown,
      isActive,
      order,
    } = req.body;

    // Check duplicates while excluding current category
    const duplicateConditions = [];

    if (name) {
      duplicateConditions.push({
        name: name.trim(),
      });
    }

    if (slug) {
      duplicateConditions.push({
        slug: slug.toLowerCase().trim(),
      });
    }

    if (hiSlug) {
      duplicateConditions.push({
        hiSlug: hiSlug.toLowerCase().trim(),
      });
    }

    if (duplicateConditions.length) {
      const duplicate = await Category.findOne({
        _id: { $ne: id },
        $or: duplicateConditions,
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message:
            "Another category with this name, slug or Hindi slug already exists",
        });
      }
    }

    if (name !== undefined) category.name = name.trim();
    if (hiName !== undefined) category.hiName = hiName;

    if (slug !== undefined) {
      category.slug = slug.toLowerCase().trim();
    }

    if (hiSlug !== undefined) {
      category.hiSlug = hiSlug.toLowerCase().trim();
    }

    if (description !== undefined) {
      category.description = description;
    }

    if (hiDescription !== undefined) {
      category.hiDescription = hiDescription;
    }

    if (icon !== undefined) category.icon = icon;
    if (color !== undefined) category.color = color;
    if (isNavbar !== undefined) category.isNavbar = isNavbar;
    if (hasDropdown !== undefined) category.hasDropdown = hasDropdown;
    if (isActive !== undefined) category.isActive = isActive;
    if (order !== undefined) category.order = order;

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    console.error("Update Category Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
        field: Object.keys(error.keyPattern || {})[0],
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: error.message,
    });
  }
};


export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: category,
    });
  } catch (error) {
    console.error("Delete Category Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: error.message,
    });
  }
};

export const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    category.isActive = !category.isActive;

    await category.save();

    return res.status(200).json({
      success: true,
      message: `Category ${
        category.isActive ? "activated" : "deactivated"
      } successfully`,
      data: category,
    });
  } catch (error) {
    console.error("Toggle Category Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update category status",
      error: error.message,
    });
  }
};




//subCategoryController.js

import SubCategory from "../NewsModals/SubCategory.js";


export const createSubCategory = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      hiName,
      hiSlug,
      hiDscription,
      category,
      isActive,
      order,
    } = req.body;

    if (!name || !slug || !hiName || !hiSlug || !category) {
      return res.status(400).json({
        success: false,
        message:
          "Name, slug, Hindi name, Hindi slug and category are required",
      });
    }

    // Validate category ID
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    // Check category exists
    const categoryExists = await Category.findById(category);

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const normalizedSlug = slug.toLowerCase().trim();
    const normalizedHiSlug = hiSlug.toLowerCase().trim();

    // Check duplicate inside same category
    const existingSubCategory = await SubCategory.findOne({
      category,
      $or: [
        { slug: normalizedSlug },
        { hiSlug: normalizedHiSlug },
      ],
    });

    if (existingSubCategory) {
      return res.status(409).json({
        success: false,
        message:
          "SubCategory with this slug or Hindi slug already exists in this category",
      });
    }

    const subCategory = await SubCategory.create({
      name: name.trim(),
      slug: normalizedSlug,
      description,
      hiName: hiName.trim(),
      hiSlug: normalizedHiSlug,
      hiDscription,
      category,
      isActive,
      order,
    });

    // Populate category
    await subCategory.populate(
      "category",
      "name hiName slug hiSlug icon color isActive"
    );

    return res.status(201).json({
      success: true,
      message: "SubCategory created successfully",
      data: subCategory,
    });
  } catch (error) {
    console.error("Create SubCategory Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "SubCategory already exists in this category",
        field: Object.keys(error.keyPattern || {})[0],
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create SubCategory",
      error: error.message,
    });
  }
};

export const getSubCategories = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search,
      category,
      categorySlug,
      name,
      hiName,
      slug,
      hiSlug,
      isActive,
      minOrder,
      maxOrder,
      sortBy = "order",
      sortOrder = "asc",
    } = req.query;

    page = Math.max(parseInt(page) || 1, 1);
    limit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);

    const skip = (page - 1) * limit;

    const filter = {};

    // ---------------------------------
    // Global Search
    // ---------------------------------
    if (search?.trim()) {
      const escapedSearch = search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const searchRegex = new RegExp(escapedSearch, "i");

      filter.$or = [
        { name: searchRegex },
        { hiName: searchRegex },
        { slug: searchRegex },
        { hiSlug: searchRegex },
        { description: searchRegex },
        { hiDscription: searchRegex },
      ];
    }

    // ---------------------------------
    // Category ID filter
    // ---------------------------------
    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }

      filter.category = category;
    }

    // ---------------------------------
    // Category Slug filter
    // ---------------------------------
    if (categorySlug) {
      const normalizedCategorySlug = decodeURIComponent(categorySlug)
        .toLowerCase()
        .trim();

      const categoryData = await Category.findOne({
        $or: [
          { slug: normalizedCategorySlug },
          { hiSlug: normalizedCategorySlug },
        ],
      }).select("_id");

      if (!categoryData) {
        return res.status(200).json({
          success: true,
          message: "No SubCategories found",
          data: [],
          pagination: {
            total: 0,
            page,
            limit,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
            nextPage: null,
            prevPage: null,
          },
        });
      }

      filter.category = categoryData._id;
    }

    // ---------------------------------
    // Individual filters
    // ---------------------------------
    if (name) {
      filter.name = new RegExp(
        name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );
    }

    if (hiName) {
      filter.hiName = new RegExp(
        hiName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );
    }

    if (slug) {
      filter.slug = slug.toLowerCase().trim();
    }

    if (hiSlug) {
      filter.hiSlug = hiSlug.toLowerCase().trim();
    }

    // ---------------------------------
    // Active filter
    // ---------------------------------
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    // ---------------------------------
    // Order range
    // ---------------------------------
    if (minOrder !== undefined || maxOrder !== undefined) {
      filter.order = {};

      if (minOrder !== undefined) {
        filter.order.$gte = Number(minOrder);
      }

      if (maxOrder !== undefined) {
        filter.order.$lte = Number(maxOrder);
      }
    }

    // ---------------------------------
    // Sorting
    // ---------------------------------
    const allowedSortFields = [
      "name",
      "hiName",
      "slug",
      "hiSlug",
      "order",
      "createdAt",
      "updatedAt",
      "isActive",
    ];

    if (!allowedSortFields.includes(sortBy)) {
      sortBy = "order";
    }

    const sortDirection =
      sortOrder === "desc" || sortOrder === "-1" ? -1 : 1;

    const sort = {
      [sortBy]: sortDirection,
      _id: 1,
    };

    // ---------------------------------
    // Query
    // ---------------------------------
    const [subCategories, total] = await Promise.all([
      SubCategory.find(filter)
        .populate(
          "category",
          "name hiName slug hiSlug icon color isActive order"
        )
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),

      SubCategory.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      message: "SubCategories fetched successfully",

      data: subCategories,

      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      },

      filters: {
        search: search || null,
        category: category || null,
        categorySlug: categorySlug || null,
        isActive:
          isActive !== undefined ? isActive === "true" : null,
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    console.error("Get SubCategories Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch SubCategories",
      error: error.message,
    });
  }
};

export const getSubCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid SubCategory ID",
      });
    }

    const subCategory = await SubCategory.findById(id)
      .populate(
        "category",
        "name hiName slug hiSlug description hiDescription icon color isActive order"
      )
      .lean();

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "SubCategory not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: subCategory,
    });
  } catch (error) {
    console.error("Get SubCategory By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch SubCategory",
      error: error.message,
    });
  }
};

export const getSubCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Slug is required",
      });
    }

    const normalizedSlug = decodeURIComponent(slug)
      .toLowerCase()
      .trim();

    const subCategory = await SubCategory.findOne({
      $or: [
        { slug: normalizedSlug },
        { hiSlug: normalizedSlug },
      ],
    })
      .populate(
        "category",
        "name hiName slug hiSlug description hiDescription icon color isActive order"
      )
      .lean();

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "SubCategory not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: subCategory,
    });
  } catch (error) {
    console.error("Get SubCategory By Slug Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch SubCategory",
      error: error.message,
    });
  }
};

export const updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid SubCategory ID",
      });
    }

    const subCategory = await SubCategory.findById(id);

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "SubCategory not found",
      });
    }

    const {
      name,
      slug,
      description,
      hiName,
      hiSlug,
      hiDscription,
      category,
      isActive,
      order,
    } = req.body;

    // Determine final category
    let finalCategory = subCategory.category;

    if (category !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }

      const categoryExists = await Category.findById(category);

      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      finalCategory = category;
    }

    const finalSlug =
      slug !== undefined
        ? slug.toLowerCase().trim()
        : subCategory.slug;

    const finalHiSlug =
      hiSlug !== undefined
        ? hiSlug.toLowerCase().trim()
        : subCategory.hiSlug;

    // Check duplicate
    const duplicate = await SubCategory.findOne({
      _id: { $ne: id },
      category: finalCategory,
      $or: [
        { slug: finalSlug },
        { hiSlug: finalHiSlug },
      ],
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message:
          "Another SubCategory with this slug already exists in this category",
      });
    }

    if (name !== undefined) {
      subCategory.name = name.trim();
    }

    if (slug !== undefined) {
      subCategory.slug = slug.toLowerCase().trim();
    }

    if (description !== undefined) {
      subCategory.description = description;
    }

    if (hiName !== undefined) {
      subCategory.hiName = hiName.trim();
    }

    if (hiSlug !== undefined) {
      subCategory.hiSlug = hiSlug.toLowerCase().trim();
    }

    if (hiDscription !== undefined) {
      subCategory.hiDscription = hiDscription;
    }

    if (category !== undefined) {
      subCategory.category = category;
    }

    if (isActive !== undefined) {
      subCategory.isActive = isActive;
    }

    if (order !== undefined) {
      subCategory.order = order;
    }

    await subCategory.save();

    await subCategory.populate(
      "category",
      "name hiName slug hiSlug icon color isActive order"
    );

    return res.status(200).json({
      success: true,
      message: "SubCategory updated successfully",
      data: subCategory,
    });
  } catch (error) {
    console.error("Update SubCategory Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "SubCategory already exists in this category",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update SubCategory",
      error: error.message,
    });
  }
};

export const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid SubCategory ID",
      });
    }

    const subCategory = await SubCategory.findByIdAndDelete(id);

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "SubCategory not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "SubCategory deleted successfully",
      data: subCategory,
    });
  } catch (error) {
    console.error("Delete SubCategory Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete SubCategory",
      error: error.message,
    });
  }
};

export const toggleSubCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid SubCategory ID",
      });
    }

    const subCategory = await SubCategory.findById(id);

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "SubCategory not found",
      });
    }

    subCategory.isActive = !subCategory.isActive;

    await subCategory.save();

    await subCategory.populate(
      "category",
      "name hiName slug hiSlug"
    );

    return res.status(200).json({
      success: true,
      message: `SubCategory ${
        subCategory.isActive ? "activated" : "deactivated"
      } successfully`,
      data: subCategory,
    });
  } catch (error) {
    console.error("Toggle SubCategory Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update SubCategory status",
      error: error.message,
    });
  }
};