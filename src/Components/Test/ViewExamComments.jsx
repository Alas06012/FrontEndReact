// components/Modal/CommentsSection.jsx
import React from "react";
import { motion } from "framer-motion";
import { Edit2 } from "lucide-react";

const ViewExamComments = ({
    comments,
    isAddingComment,
    userRole,
    commentFields,
    handleAddComment,
    handleEditCommentClick,
    setIsAddingComment,
    Form,
    onCloseMobile, // mobiles
}) => {
    const canEdit = userRole === "admin" || userRole === "teacher";
    const isMobile = window.innerWidth < 768;

    const handleOpenComments = () => {
        if (detailsScrollRef.current) {
            setScrollPosition(detailsScrollRef.current.scrollTop);
        }
        setShowMobileComments(true);
    };

    return (
        <motion.div
            className="p-4 overflow-y-auto max-h-[90vh] relative"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
        >
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white z-10 py-2">
                <h3 className="text-lg font-semibold text-gray-800">Comments</h3>
                {isMobile && onCloseMobile && (
                    <button
                        onClick={onCloseMobile}
                        className="text-gray-500 hover:text-gray-800 px-3 py-1 text-sm border border-gray-300 rounded-lg transition"
                    >
                        ✕ Close
                    </button>
                )}
            </div>

            {isAddingComment ? (
                <Form
                    fields={commentFields}
                    onSubmit={handleAddComment}
                    onCancel={() => setIsAddingComment(false)}
                    submitText="Save Comment"
                    layout="grid-cols-1"
                />
            ) : comments.length > 0 ? (
                <div className="space-y-4">
                    {comments.map((comment, index) => (
                        <motion.div
                            key={comment.pk_comment}
                            className="bg-white p-4 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition duration-300"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-semibold text-lg text-gray-900">
                                        {comment.comment_title}
                                    </h4>
                                    <p className="text-gray-600 mt-2">{comment.comment_value}</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        by {comment.author},{" "}
                                        {new Date(comment.created_at).toLocaleString()}
                                    </p>
                                </div>

                                {canEdit && (
                                    <button
                                        onClick={() => handleEditCommentClick(comment)}
                                        className="text-blue-600 hover:text-blue-800 ml-4 transition duration-200"
                                        title="Edit Comment"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {canEdit && (
                        <motion.button
                            onClick={() => setIsAddingComment(true)}
                            className="mt-4 bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-md"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Add New Comment
                        </motion.button>
                    )}
                </div>
            ) : (
                <div>
                    <p className="text-gray-600 mb-4">No comments available.</p>
                    {canEdit && (
                        <motion.button
                            onClick={() => setIsAddingComment(true)}
                            className="mt-4 bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-md"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Add Comment
                        </motion.button>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default ViewExamComments;
